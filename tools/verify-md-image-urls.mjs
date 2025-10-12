import fs from 'node:fs/promises'
import fss from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

// ===== Config =====
const config = {
    contentDir: path.join(root, 'content/categorias'),
    publicImgDir: path.join(root, 'public/img'),
    logPath: path.join(root, 'logs/verify-md-image-urls.log')
}

// Flags
const args = process.argv.slice(2)
const FIX = args.includes('--fix')

// ===== Helpers =====
const isAbsoluteWebUrl = (u) =>
    /^\/|^https?:\/\//i.test(u) || /^data:/i.test(u)

const isWantedAbsolute = (u) =>
    /^\/img\//i.test(u) // en MD queremos /img/...

const isLikelyImage = (u) =>
    /\.(png|jpe?g|webp|gif|svg|avif|bmp|tiff)(\?.*)?$/i.test(u) || /^data:image\//i.test(u)

async function walk(dir) {
    const out = []
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const e of entries) {
        const full = path.join(dir, e.name)
        if (e.isDirectory()) out.push(...await walk(full))
        else if (e.isFile() && full.endsWith('.md')) out.push(full)
    }
    return out
}

function* findMarkdownImageMatches(text) {
    // ![alt](url "title")
    const re = /!\[([^\]]*)\]\(([^)\s]+)([^)]*)\)/g
    let m
    while ((m = re.exec(text))) {
        const [full, alt, url, tail] = m
        yield { kind: 'md', full, alt, url, tail, index: m.index, length: m[0].length }
    }
}

function* findHtmlImgMatches(text) {
    // <img ... src="url" ...>
    const re = /<img\b[^>]*\bsrc=(["'])(.*?)\1/gi
    let m
    while ((m = re.exec(text))) {
        const [full, q, url] = m
        yield { kind: 'html', full, url, quote: q, index: m.index, length: m[0].length }
    }
}

function lineOf(text, idx) {
    // 1-based line number
    let line = 1
    for (let i = 0; i < idx; i++) if (text.charCodeAt(i) === 10) line++
    return line
}

function rel(p) { return path.relative(root, p) }

async function findInPublicImg(basename) {
    const matches = []
    async function _walk(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true })
        for (const e of entries) {
            const full = path.join(dir, e.name)
            if (e.isDirectory()) await _walk(full)
            else if (e.isFile() && e.name.toLowerCase() === basename.toLowerCase()) {
                matches.push('/img' + full.replace(config.publicImgDir, '').split(path.sep).join('/'))
            }
        }
    }
    if (fss.existsSync(config.publicImgDir)) {
        await _walk(config.publicImgDir)
    }
    return matches
}

// Split raw into FM + body without reserializar FM
function splitFrontMatter(raw) {
    const m = raw.match(/^---\n[\s\S]*?\n---\n/)
    if (m) {
        const fm = m[0]
        const body = raw.slice(fm.length)
        return { fm, body }
    }
    return { fm: '', body: raw }
}

// ===== Core =====
async function processFile(file) {
    const raw = await fs.readFile(file, 'utf8')
    const { fm, body } = splitFrontMatter(raw)

    // Sólo para delimitar body con precisión, usamos gray-matter (no para reescribir)
    const parsed = matter(raw)
    const bodyChecked = parsed.content // por si hubiera edge cases con excerpt
    const bodyOffset = raw.length - body.length // estimación; usaremos "body" para escritura

    let issues = []
    let fixedBody = body
    let replaced = 0

    // Recolectar matches del body (MD + HTML)
    const matches = [
        ...findMarkdownImageMatches(bodyChecked),
        ...findHtmlImgMatches(bodyChecked)
    ].sort((a, b) => a.index - b.index)

    for (const match of matches) {
        const url = match.url.trim()

        // Ignora no-imágenes
        if (!isLikelyImage(url)) continue

        const line = lineOf(bodyChecked, match.index)

        if (!isAbsoluteWebUrl(url)) {
            // relativa → intentar resolver en /public/img
            const basename = path.basename(url.split('?')[0])
            const candidates = await findInPublicImg(basename)

            if (candidates.length === 1) {
                const newUrl = candidates[0]
                issues.push({
                    type: 'RELATIVE_URL',
                    file, line, url, suggestion: newUrl
                })
                if (FIX) {
                    if (match.kind === 'md') {
                        // Reemplazo conservador: solo la URL dentro del paréntesis
                        const re = new RegExp(`(!\\[[^\\]]*\\]\\()${escapeRegExp(url)}(\\b[^)]*)\\)`)
                        fixedBody = fixedBody.replace(re, `$1${newUrl}$2)`)
                        replaced++
                    } else {
                        const re = new RegExp(`(<img\\b[^>]*\\bsrc=)(["'])${escapeRegExp(url)}\\2`, 'i')
                        fixedBody = fixedBody.replace(re, `$1"${newUrl
                            }"`)
                        replaced++
                    }
                }
            } else if (candidates.length === 0) {
                issues.push({
                    type: 'RELATIVE_URL_NOT_FOUND',
                    file, line, url, note: `No se encontró "${basename}" en /public/img`
                })
            } else {
                issues.push({
                    type: 'RELATIVE_URL_AMBIGUOUS',
                    file, line, url, note: `Múltiples coincidencias en /public/img`,
                    candidates
                })
            }
        } else {
            // Absoluta: en MD queremos /img/ (no /_ipx, ni otras)
            if (/^\/_ipx\//i.test(url)) {
                issues.push({ type: 'IPX_IN_MD', file, line, url, note: 'Evita /_ipx en Markdown; usa /img/…' })
            } else if (/^\//.test(url) && !isWantedAbsolute(url)) {
                issues.push({ type: 'ABSOLUTE_NOT_IN_IMG', file, line, url, note: 'Absoluta pero fuera de /img/…' })
            }
        }
    }

    // Escribir sólo si FIX y hubo cambios
    if (FIX && replaced > 0) {
        const out = fm + fixedBody
        if (out !== raw) {
            await fs.mkdir(path.dirname(file), { recursive: true })
            await fs.writeFile(file, out, 'utf8')
        }
    }

    return { file, issues, replaced }
}

function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function run() {
    if (!fss.existsSync(config.contentDir)) {
        console.error(`❌ No existe ${config.contentDir}`)
        process.exit(1)
    }
    const files = await walk(config.contentDir)
    console.log(`🔍 Escaneando ${files.length} archivo(s) en ${rel(config.contentDir)} …`)

    const allIssues = []
    let totalReplaced = 0

    for (const file of files) {
        try {
            const { issues, replaced } = await processFile(file)
            totalReplaced += replaced
            allIssues.push(...issues)
        } catch (e) {
            console.error(`❌ Error en ${rel(file)}:`, e.message)
        }
    }

    // Log y resumen
    await fs.mkdir(path.dirname(config.logPath), { recursive: true })
    const lines = allIssues.map(i => {
        const header = `[${i.type}] ${rel(i.file)}:${i.line}`
        const main = ` url="${i.url}"`
        const sug = i.suggestion ? ` -> "${i.suggestion}"` : ''
        const note = i.note ? ` (${i.note})` : ''
        const cand = i.candidates ? `\n  candidates:\n   - ${i.candidates.join('\n   - ')}` : ''
        return `${header}${main}${sug}${note}${cand}`
    })
    await fs.writeFile(config.logPath, lines.join('\n') + (lines.length ? '\n' : ''), 'utf8')

    console.log(`\n📝 Log: ${rel(config.logPath)}`)
    console.log(`📊 Issues: ${allIssues.length}`)
    if (FIX) console.log(`🛠️ Reemplazos en cuerpo MD: ${totalReplaced}`)
    console.log('🏁 Hecho.')
}

run().catch(e => {
    console.error('❌ Error general:', e)
    process.exit(1)
})
