#!/usr/bin/env node
// Recorre content/productos/**/*.md y añade subcategorySlug si falta.
// Inferencia por este orden:
// 1) ultimo segmento de categorySlug
// 2) slug de subcategoria detectado en la ruta del archivo del producto
// 3) reglas manuales (RULES)

import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import fg from 'fast-glob'
import yaml from 'js-yaml'

const ROOT = process.cwd()
const CONTENT_DIR = path.join(ROOT, 'content')
const CATEG_DIR = path.join(CONTENT_DIR, 'categorias')
const PROD_DIR = path.join(CONTENT_DIR, 'productos')

const DRY_RUN = process.argv.includes('--dry') || process.argv.includes('--dry-run')
const MAKE_BAK = true

const RULES = [
    // { match: /roll-?up/i, sub: 'material-rigido' },
    // { match: /lona|vinilo/i, sub: 'material-flexible' },
]

const norm = (s) => (s ?? '').toString().trim().toLowerCase()
const lastSeg = (s) => {
    const t = norm(s).split('/').filter(Boolean)
    return t.length ? t[t.length - 1] : ''
}
const includesAny = (text, candidates) => {
    const n = norm(text)
    for (const c of candidates) if (n.includes(norm(c))) return c
    return null
}

async function readText(file) {
    try { return await fs.readFile(file, 'utf8') } catch { return null }
}
async function writeText(file, text) {
    await fs.mkdir(path.dirname(file), { recursive: true })
    await fs.writeFile(file, text, 'utf8')
}

// Descubre slugs de subcategorias mirando content/categorias/**/index.md.
// Si type=subcategoria -> subcat. Si YAML falla o no hay type, considera subcat si profundidad >= 2.
async function discoverSubcategorySlugs() {
    const indexFiles = await fg('**/index.md', { cwd: CATEG_DIR, absolute: true, dot: false })
    const subs = new Set()

    for (const file of indexFiles) {
        const raw = await readText(file)
        if (!raw) continue

        let fmData = {}
        let parsedOK = true
        try {
            const fm = matter(raw)
            fmData = fm.data || {}
        } catch (e) {
            parsedOK = false
            console.warn('[warn] YAML roto en', path.relative(ROOT, file), '-', e?.message || e)
        }

        const relDir = path.relative(CATEG_DIR, path.dirname(file)) // ej: "gran-formato/material-rigido"
        const segs = relDir.split(path.sep).filter(Boolean)
        const folderSlug = segs.length ? segs[segs.length - 1] : ''

        const fmType = norm(fmData.type)
        const fmSlug = norm(fmData.slug)

        const isSub = parsedOK
            ? (fmType === 'subcategoria' || segs.length >= 2)
            : (segs.length >= 2) // fallback si YAML está roto

        if (isSub) subs.add(fmSlug || folderSlug)
    }

    const out = Array.from(subs).filter(Boolean)
    console.log('[discover] subcategories:', out.length, out.length ? '-> ' + out.join(', ') : '')
    return out
}

async function processProducts(subcatSlugs) {
    const files = await fg('**/*.md', { cwd: PROD_DIR, absolute: true, dot: false })
    if (!files.length) { console.log('[products] no product files found in', PROD_DIR); return }
    console.log('[products] files:', files.length)

    let touched = 0, already = 0, skipped = 0

    for (const file of files) {
        const raw = await readText(file)
        if (!raw) { skipped++; continue }

        let fm
        try {
            fm = matter(raw)
        } catch (e) {
            console.warn('[warn] YAML producto roto en', path.relative(ROOT, file), '-', e?.message || e)
            skipped++
            continue
        }
        const data = fm.data || {}

        if (data.subcategorySlug) { already++; continue }

        const fromCategorySlug = lastSeg(data.categorySlug)
        const fromFilePath = includesAny(file, subcatSlugs)
        const fromRules = (() => {
            const mix = (data.title ? String(data.title) : '') + ' ' + file
            const rule = RULES.find(r => r.match.test(mix))
            return rule ? rule.sub : null
        })()

        let sub = null
        if (fromCategorySlug && subcatSlugs.includes(fromCategorySlug)) sub = fromCategorySlug
        else if (fromFilePath) sub = fromFilePath
        else if (fromRules) sub = fromRules

        if (!sub) { skipped++; continue }

        const newData = { ...data, subcategorySlug: sub }
        const newRaw = matter.stringify(fm.content, newData, {
            language: 'yaml',
            stringify: (obj) => yaml.dump(obj, { lineWidth: 1000 })
        })

        if (DRY_RUN) {
            console.log('[dry]', path.relative(ROOT, file), '-> subcategorySlug:', sub)
        } else {
            if (MAKE_BAK) await writeText(file + '.bak', raw)
            await writeText(file, newRaw)
            console.log('[ok ]', path.relative(ROOT, file), '-> subcategorySlug:', sub)
        }
        touched++
    }

    console.log('[summary] updated:', touched, 'already:', already, 'skipped:', skipped)
}

; (async () => {
    console.log('[start]')
    const subSlugs = await discoverSubcategorySlugs()
    if (!subSlugs.length) {
        console.log('[warn] no subcategories discovered. Revisa content/categorias: estructura y type: subcategoria.')
    }
    await processProducts(subSlugs)
})().catch((e) => {
    console.error(e)
    process.exit(1)
})

