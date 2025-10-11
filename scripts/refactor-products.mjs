// scripts/refactor-products.mjs
// Uso:
//   node scripts/refactor-products.mjs --dry-run --base-url=https://reprodisseny.com \
//       --default-category=adhesivos --map=scripts/category-map.json --keep-extras
//
// Flags:
//   --dry-run              No escribe, solo simula
//   --keep-extras         Conserva claves no contempladas en la plantilla (las deja al final)
//   --base-url=...        Base para canonical/schema.image/url (def: https://reprodisseny.com)
//   --default-category=.. Fallback si no se puede inferir (def: sin-categoria)
//   --map=...             JSON { "<slug>": "categoria", ... } para asignar/forzar categories

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

/** ===== Config ===== */
const ROOT = process.cwd()
const PRODUCTS_DIR = path.resolve('content/productos')
const LOG_FILE = path.resolve('logs/refactored-products.txt')

const argv = new Map(process.argv.slice(2).map(a => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/)
    return m ? [m[1], m[2] ?? true] : [a, true]
}))
const DRY_RUN = argv.has('dry-run')
const KEEP_EXTRAS = argv.has('keep-extras')
const BASE_URL = argv.get('base-url') || 'https://reprodisseny.com'
const DEFAULT_CATEGORY = argv.get('default-category') || 'sin-categoria'
const MAP_PATH = argv.get('map')
const CATEGORY_MAP = MAP_PATH && fs.existsSync(MAP_PATH)
    ? JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'))
    : {}

const DEFAULTS = {
    brand: 'Repro Disseny',
    currency: 'EUR',
    placeholder: '/img/placeholders/mockup.webp'
}
const AVAIL = {
    IN: 'https://schema.org/InStock',
    OUT: 'https://schema.org/OutOfStock'
}
const COND_NEW = 'https://schema.org/NewCondition'

/** ===== Utils ===== */
const isMd = (f) => f.toLowerCase().endsWith('.md')
const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true })
        .flatMap(e => e.isDirectory()
            ? walk(path.join(dir, e.name))
            : (e.isFile() && isMd(e.name) && e.name.toLowerCase() !== 'index.md') ? [path.join(dir, e.name)] : [])

const titleCase = (s = '') => s.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, c => c.toUpperCase())
const ensureArr = (v) => Array.isArray(v) ? v : (v ? [v] : [])
const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)))
const isSchemaUrl = (v) => typeof v === 'string' && /^https?:\/\/schema\.org\//i.test(v)
const unMarkdown = (v) => {
    if (typeof v !== 'string') return v
    const m = v.match(/^\[.+?\]\((https?:\/\/[^)]+)\)$/)
    return m ? m[1] : v
}
function extractTitle(content) {
    const m = content.match(/^#\s+(.+)/m)
    return m ? m[1].trim() : null
}
function extractDescription(md) {
    const lines = md.split('\n')
    let inFM = true, inCode = false
    for (const line of lines) {
        const t = line.trim()
        if (t === '---') { inFM = !inFM; continue }
        if (inFM) continue
        if (t.startsWith('```')) { inCode = !inCode; continue }
        if (inCode) continue
        if (t && !/^([#\-*`!<\[])/.test(t)) return t
    }
    return ''
}
function deriveCategory(fileAbs, data, slug) {
    // 1) mapa explícito
    if (CATEGORY_MAP[slug]) return CATEGORY_MAP[slug]
    // 2) front-matter existente
    const fromField = (data.categorySlug || data.category || '').trim()
    if (fromField) return fromField
    // 3) breadcrumbs → /categorias/:slug
    if (Array.isArray(data.breadcrumbs)) {
        for (const b of data.breadcrumbs) {
            const m = typeof b?.url === 'string' && b.url.match(/^\/categorias\/([^/]+)\/?$/)
            if (m) return m[1]
        }
    }
    // 4) carpeta
    const relDir = path.relative(PRODUCTS_DIR, path.dirname(fileAbs))
    const fromPath = relDir.split(path.sep).filter(Boolean)[0]
    if (fromPath) return fromPath
    // 5) fallback de CLI
    return DEFAULT_CATEGORY
}
const ORDER = [
    'type',
    // Identificación
    'slug', 'categorySlug', 'subcategorySlug',
    // Básicos
    'title', 'description', 'image', 'images', 'alt',
    // SEO
    'metatitle', 'metadescription', 'canonical', 'hreflang', 'breadcrumbs', 'keywords', 'searchTerms',
    // Comercio
    'sku', 'gtin', 'mpn', 'brand', 'price', 'priceCurrency', 'priceValidUntil', 'availability', 'itemCondition', 'inStock',
    // Logística
    'productionTime', 'minOrderQty', 'shippingDetails', 'returnPolicy',
    // Media
    'galleryImages',
    // Opiniones
    'ratingValue', 'reviewCount',
    // Contenido/conversión
    'specs', 'templates', 'useCases', 'badges', 'relatedSlugs',
    // Formulario
    'formFields', 'faqs',
    // Ads
    'ad',
    // Schema
    'schema'
]
function sortFrontmatter(obj) {
    const out = {}
    for (const k of ORDER) if (k in obj) out[k] = obj[k]
    if (!KEEP_EXTRAS) return out
    for (const k of Object.keys(obj)) if (!(k in out)) out[k] = obj[k]
    return out
}

/** ===== Refactor ===== */
const changed = []
function refactorOne(file) {
    const raw = fs.readFileSync(file, 'utf8')
    const parsed = matter(raw)
    const d0 = parsed.data || {}
    const body = parsed.content || '\n'

    // slug
    const slug = (d0.slug || path.basename(file, '.md')).trim()

    // categorySlug
    const categorySlug = deriveCategory(file, d0, slug)
    const rel = path.relative(PRODUCTS_DIR, file)
    if (!categorySlug) console.warn(`⚠️ ${rel}: categorySlug vacío (usando ${DEFAULT_CATEGORY})`)

    // básicos
    const title = d0.title || extractTitle(body) || titleCase(slug)
    const description = d0.description || extractDescription(raw) || ''

    // imagen/es (clonar arrays para evitar anchors YAML)
    const image = (d0.image && d0.image !== '/img/productos/mockupProduct.webp')
        ? d0.image
        : (d0.image || DEFAULTS.placeholder)
    const images = uniq([...ensureArr(d0.images), ...ensureArr(d0.galleryImages), image])
    const galleryImages = uniq([...ensureArr(d0.galleryImages)])

    // SEO
    const canonical = d0.canonical || `${BASE_URL}/productos/${slug}`
    const hreflang = Array.isArray(d0.hreflang) && d0.hreflang.length
        ? d0.hreflang
        : [
            { lang: 'es-ES', url: canonical },
            { lang: 'ca-ES', url: canonical }
        ]
    const breadcrumbs = Array.isArray(d0.breadcrumbs) && d0.breadcrumbs.length
        ? d0.breadcrumbs
        : [
            { name: 'Inicio', url: '/' },
            { name: titleCase(categorySlug || 'Productos'), url: categorySlug ? `/categorias/${categorySlug}` : '/productos' },
            { name: title, url: `/productos/${slug}` }
        ]

    // comercio
    const price = typeof d0.price === 'number' ? d0.price : 0
    const priceCurrency = d0.priceCurrency || DEFAULTS.currency
    const brand = d0.brand || DEFAULTS.brand
    const inStock = typeof d0.inStock === 'boolean' ? d0.inStock : true
    const availability = isSchemaUrl(unMarkdown(d0.availability))
        ? unMarkdown(d0.availability)
        : (inStock ? AVAIL.IN : AVAIL.OUT)
    const itemCondition = isSchemaUrl(unMarkdown(d0.itemCondition))
        ? unMarkdown(d0.itemCondition)
        : COND_NEW
    const priceValidUntil = d0.priceValidUntil || new Date(new Date().getFullYear() + 1, 11, 31)
        .toISOString().slice(0, 10)

    // opiniones
    const ratingValue = Math.max(0, Math.min(5, Number(d0.ratingValue ?? 0))) || 0
    const reviewCount = Number.isInteger(d0.reviewCount) ? d0.reviewCount : 0
    const includeRating = ratingValue > 0 && reviewCount > 0

    // Ads (recorte a límites RSA)
    const ad0 = d0.ad || {}
    const ad = {
        finalUrl: ad0.finalUrl || '',
        path1: ad0.path1 || (categorySlug || ''),
        path2: ad0.path2 || slug,
        headlines: ensureArr(ad0.headlines).slice(0, 15),
        descriptions: ensureArr(ad0.descriptions).slice(0, 4),
        callouts: ensureArr(ad0.callouts),
        structuredSnippets: Array.isArray(ad0.structuredSnippets) ? ad0.structuredSnippets : [],
        sitelinks: Array.isArray(ad0.sitelinks) ? ad0.sitelinks : []
    }

    // schema (si existe, lo respetamos y solo saneamos; si no, generamos)
    let schema = d0.schema
    if (!schema) {
        schema = {
            '@type': 'Product',
            name: title,
            description,
            image: images.map(src => src.startsWith('http') ? src : `${BASE_URL}${src}`),
            sku: d0.sku || '',
            gtin: d0.gtin || '',
            mpn: d0.mpn || (d0.sku ? `REF-${String(d0.sku).toUpperCase()}` : ''),
            brand: { '@type': 'Brand', name: brand },
            ...(includeRating ? { aggregateRating: { '@type': 'AggregateRating', ratingValue, reviewCount } } : {}),
            offers: {
                '@type': 'Offer',
                url: canonical,
                price, priceCurrency, availability, priceValidUntil, itemCondition
            }
        }
    } else {
        // saneo mínimo de schema existente
        if (schema.image) {
            const arr = ensureArr(schema.image).map(src => (typeof src === 'string' && !src.startsWith('http')) ? `${BASE_URL}${src}` : src)
            schema.image = arr
        }
        if (schema.offers) {
            const so = schema.offers
            if (so.availability) so.availability = unMarkdown(so.availability)
            if (!isSchemaUrl(so.availability || '')) so.availability = availability
            if (so.itemCondition) so.itemCondition = unMarkdown(so.itemCondition)
            if (!isSchemaUrl(so.itemCondition || '')) so.itemCondition = itemCondition
            if (!so.priceCurrency) so.priceCurrency = priceCurrency
            if (!so.url) so.url = canonical
        }
    }

    /** nuevo front-matter */
    const fm = sortFrontmatter({
        type: 'producto',
        // Identificación
        slug,
        categorySlug,
        ...(d0.subcategorySlug ? { subcategorySlug: d0.subcategorySlug } : {}),

        // Básicos
        title,
        description,
        image,
        images: images.length ? [...images] : [DEFAULTS.placeholder],
        alt: d0.alt || `Imagen de ${title}`,

        // SEO
        metatitle: d0.metatitle || d0.metaTitle || `${title} | ${DEFAULTS.brand}`,
        metadescription: d0.metadescription || d0.metaDescription || description,
        canonical,
        hreflang,
        breadcrumbs,
        keywords: ensureArr(d0.keywords),
        searchTerms: ensureArr(d0.searchTerms),

        // Comercio
        sku: d0.sku || '',
        gtin: d0.gtin || '',
        mpn: d0.mpn || '',
        brand,
        price,
        priceCurrency,
        priceValidUntil,
        availability,
        itemCondition,
        inStock,

        // Logística
        productionTime: d0.productionTime || '24–72 h',
        minOrderQty: typeof d0.minOrderQty === 'number' ? d0.minOrderQty : 1,
        shippingDetails: d0.shippingDetails || { regions: ['ES', 'PT'], handlingTime: '24 h', transitTime: '24–72 h' },
        returnPolicy: d0.returnPolicy || { days: 14, method: 'devolución en tienda y recogida' },

        // Media
        galleryImages: [...galleryImages],

        // Opiniones
        ratingValue,
        reviewCount,

        // Contenido / conversión
        specs: Array.isArray(d0.specs) ? d0.specs : [],
        templates: Array.isArray(d0.templates) ? d0.templates : [],
        useCases: Array.isArray(d0.useCases) ? d0.useCases : [],
        badges: Array.isArray(d0.badges) ? d0.badges : [],
        relatedSlugs: Array.isArray(d0.relatedSlugs) ? d0.relatedSlugs : [],

        // Formulario
        formFields: Array.isArray(d0.formFields) ? d0.formFields : [],
        faqs: Array.isArray(d0.faqs) ? d0.faqs : [],

        // Ads
        ad,

        // Schema
        schema
    })

    const out = matter.stringify(body, fm, { lineWidth: 0 })
    if (out !== raw) {
        if (!DRY_RUN) fs.writeFileSync(file, out, 'utf8')
        changed.push(file)
        console.log(`${DRY_RUN ? '[DRY-RUN]' : '✅'} ${path.relative(ROOT, file)} ${DRY_RUN ? '→ se actualizaría' : 'actualizado'}`)
    } else {
        console.log(`👌 ${path.relative(ROOT, file)} sin cambios`)
    }
}

/** ===== Runner ===== */
; (function main() {
    if (!fs.existsSync(PRODUCTS_DIR)) {
        console.error(`❌ No existe ${PRODUCTS_DIR}`)
        process.exit(1)
    }
    const files = walk(PRODUCTS_DIR)
    console.log(`🔎 ${files.length} productos encontrados en ${PRODUCTS_DIR}`)
    for (const f of files) {
        try { refactorOne(f) } catch (e) { console.error(`❌ Error ${f}: ${e.message}`) }
    }
    if (!DRY_RUN && changed.length) {
        fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true })
        fs.writeFileSync(LOG_FILE, changed.join('\n') + '\n', 'utf8')
        console.log(`📝 Log: ${LOG_FILE}`)
    }
    console.log(`🏁 Listo. ${changed.length} archivo(s) ${DRY_RUN ? 'se modificarían' : 'actualizados'}.`)
})()
