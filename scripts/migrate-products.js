#!/usr/bin/env node
/* eslint-disable no-console */
import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'

const ROOT = process.cwd()
const SRC_DIR = path.join(ROOT, 'content', 'categorias')
const DST_DIR = path.join(ROOT, 'content', 'productos')
const APPLY = process.argv.includes('--apply')

/** utils */
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
const exists = async (p) => !!(await fs.stat(p).catch(() => null))

const toKebab = (s = '') =>
    String(s)
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'item'

/** Detecta si un md “parece” producto */
function isProductDoc(fm, fileName) {
    if (fm?.type === 'producto') return true
    const base = path.basename(fileName).toLowerCase()
    if (base === 'index.md') return false
    // señales suaves
    if ('price' in fm || 'sku' in fm) return true
    return false
}

/** Deriva categorySlug desde la ruta de categorias:
 *   content/categorias/<cat>/.../<file>.md  ->  último segmento de carpeta
 */
function deriveCategorySlugFromPath(absFile) {
    const rel = path.relative(SRC_DIR, absFile)
    const segments = rel.split(path.sep)
    if (segments.length <= 1) return '' // no carpeta
    // quitar el filename
    segments.pop()
    // tomar el último directorio como la categoría final
    const lastDir = segments.pop() || ''
    return toKebab(lastDir)
}

/** Normaliza frontmatter a la “opción B” */
function normalizeFrontmatter(fmRaw, ctx) {
    const fm = { ...fmRaw }

    // 1) type
    fm.type = 'producto'

    // 2) slug
    if (!fm.slug || String(fm.slug).trim() === '') {
        // del filename sin extensión
        const base = path.basename(ctx.srcFile, '.md')
        fm.slug = toKebab(fm.slug || base)
    } else {
        fm.slug = toKebab(String(fm.slug))
    }

    // 3) categorySlug: preferir ya existente; si no, usar "category"; si no, derivar del path
    if (fm.categorySlug && String(fm.categorySlug).trim() !== '') {
        fm.categorySlug = toKebab(String(fm.categorySlug))
    } else if (fm.category && String(fm.category).trim() !== '') {
        fm.categorySlug = toKebab(String(fm.category))
        delete fm.category
    } else {
        fm.categorySlug = deriveCategorySlugFromPath(ctx.srcAbs)
    }

    // 4) normalizar metaTitle/metaDescription -> metatitle/metadescription
    if (fm.metaTitle && !fm.metatitle) {
        fm.metatitle = fm.metaTitle
    }
    if (fm.metaDescription && !fm.metadescription) {
        fm.metadescription = fm.metaDescription
    }
    delete fm.metaTitle
    delete fm.metaDescription

    // 5) priceCurrency como string ISO
    if (fm.priceCurrency != null) {
        fm.priceCurrency = String(fm.priceCurrency).toUpperCase()
    }

    // 6) order por defecto
    if (typeof fm.order !== 'number') fm.order = 0

    return fm
}

/** Genera un path de destino único evitando colisiones */
async function uniqueDestPath(baseDir, slug) {
    let out = path.join(baseDir, `${slug}.md`)
    if (!(await exists(out))) return out
    let i = 2
    while (await exists(out)) {
        out = path.join(baseDir, `${slug}-${i}.md`)
        i++
    }
    return out
}

/** Procesa un .md individual */
async function processMd(absFile) {
    const srcRel = path.relative(ROOT, absFile)
    const raw = await fs.readFile(absFile, 'utf8')
    const parsed = matter(raw)
    const fm = parsed.data || {}

    if (!isProductDoc(fm, absFile)) {
        return { skipped: true, reason: 'not-a-product', file: srcRel }
    }

    // Normalizar FM
    const normalized = normalizeFrontmatter(fm, { srcFile: absFile, srcAbs: absFile })

    // Asegurar carpeta destino
    if (!APPLY) {
        console.log(`[dry-run] MOVE ${srcRel} -> content/productos/${normalized.slug}.md  (categorySlug=${normalized.categorySlug})`)
        return { moved: false, file: srcRel, slug: normalized.slug, categorySlug: normalized.categorySlug }
    }

    await fs.mkdir(DST_DIR, { recursive: true })
    const dstAbs = await uniqueDestPath(DST_DIR, normalized.slug)

    const newContent = matter.stringify(parsed.content || '', normalized)
    await fs.writeFile(dstAbs, newContent, 'utf8')
    await fs.unlink(absFile)

    const dstRel = path.relative(ROOT, dstAbs)
    console.log(`✔ moved: ${srcRel} -> ${dstRel}`)
    return { moved: true, from: srcRel, to: dstRel }
}

/** Recorrido recursivo sin dependencias */
async function walk(dir, out = []) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const e of entries) {
        const p = path.join(dir, e.name)
        if (e.isDirectory()) {
            await walk(p, out)
        } else if (e.isFile() && p.toLowerCase().endsWith('.md')) {
            out.push(p)
        }
    }
    return out
}

async function main() {
    if (!(await exists(SRC_DIR))) {
        console.error(`✖ No existe ${SRC_DIR}. ¿Ruta correcta?`)
        process.exit(1)
    }
    console.log(`Scanning: ${path.relative(ROOT, SRC_DIR)} …`)
    const files = await walk(SRC_DIR)
    if (!files.length) {
        console.log('No hay .md en categorias.')
        return
    }

    let moved = 0, skipped = 0
    for (const f of files) {
        try {
            const res = await processMd(f)
            if (res?.moved) moved++
            else skipped++
            // peq. pausa para no saturar
            await sleep(2)
        } catch (err) {
            console.error(`✖ error procesando ${path.relative(ROOT, f)}:`, err?.message || err)
        }
    }

    console.log(`\nResumen: moved=${moved}, skipped=${skipped}, mode=${APPLY ? 'APPLY' : 'DRY-RUN'}`)
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
