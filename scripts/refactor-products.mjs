// scripts/refactor-products.mjs
import fs from 'node:fs/promises';
import fss from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const config = {
    baseDir: path.join(root, 'content/productos'),   // <-- ajusta si tu ruta es distinta
    baseUrl: 'https://reprodisseny.com',
    logPath: path.join(root, 'logs/refactored-products.txt'),
};

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

const ORDER = [
    'type',
    // Identificación
    'slug', 'categorySlug',
    // Básicos
    'title', 'description', 'image', 'alt',
    // Media
    'galleryImages',
    // Comercio
    'sku', 'mpn', 'gtin13', 'brand', 'price', 'priceCurrency', 'inStock',
    // Opiniones
    'ratingValue', 'reviewCount',
    // Atributos/variantes
    'attributes', 'variants',
    // Formularios
    'formFields',
    // SEO
    'metaTitle', 'metaDescription', 'canonical', 'hreflang', 'keywords', 'searchTerms',
    // Schema
    'schema'
];

const sortFM = (obj) => {
    const out = {};
    for (const k of ORDER) if (k in obj) out[k] = obj[k];
    for (const k of Object.keys(obj)) if (!(k in out)) out[k] = obj[k];
    return out;
};

const toTitle = s => (s || '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

function normalizeImage(img, fallbackName = '') {
    if (!img) return { src: '', width: 1200, height: 800 };
    if (typeof img === 'string') {
        const src = img.startsWith('/') ? img : `/img/productos/${img}`;
        return { src, width: 1200, height: 800 };
    }
    return {
        src: img.src || '',
        width: img.width ?? 1200,
        height: img.height ?? 800
    };
}

function ensureHreflang(list, canonical) {
    const arr = Array.isArray(list) ? list.filter(x => x && x.lang && x.url) : [];
    if (canonical && !arr.some(x => x.lang === 'es-ES')) arr.push({ lang: 'es-ES', url: canonical });
    return arr;
}

function buildData(oldData, filePath) {
    const slug = oldData.slug || path.basename(filePath, '.md');
    const title = oldData.title || toTitle(slug);
    const canonical = oldData.canonical || `${config.baseUrl}/productos/${slug}`;

    // normaliza imagen
    const image = normalizeImage(oldData.image, title);

    // SEO camelCase (compat metatitle/metadescription)
    const metaTitle = oldData.metaTitle || oldData.metatitle || `${title} | ${oldData.brand || 'Repro Disseny'}`;
    const metaDescription = oldData.metaDescription || oldData.metadescription || oldData.description || '';

    const data = {
        type: 'producto',

        // Identificación
        slug,
        categorySlug: oldData.categorySlug || '',

        // Básicos
        title,
        description: oldData.description || '',
        image,
        alt: oldData.alt || `Imagen de ${title}`,

        // Media
        galleryImages: Array.isArray(oldData.galleryImages) ? oldData.galleryImages : [],

        // Comercio
        sku: oldData.sku || '',
        mpn: oldData.mpn || '',
        gtin13: oldData.gtin13 || '',
        brand: oldData.brand || 'Repro Disseny',
        price: Number.isFinite(oldData.price) ? oldData.price : 0,
        priceCurrency: oldData.priceCurrency || 'EUR',
        inStock: typeof oldData.inStock === 'boolean' ? oldData.inStock : true,

        // Opiniones
        ratingValue: Number.isFinite(oldData.ratingValue) ? oldData.ratingValue : 0,
        reviewCount: Number.isFinite(oldData.reviewCount) ? oldData.reviewCount : 0,

        // Atributos/variantes
        attributes: Array.isArray(oldData.attributes) ? oldData.attributes : [],
        variants: Array.isArray(oldData.variants) ? oldData.variants : [],

        // Formularios
        formFields: Array.isArray(oldData.formFields) ? oldData.formFields : [],

        // SEO
        metaTitle,
        metaDescription,
        canonical,
        hreflang: ensureHreflang(oldData.hreflang, canonical),
        keywords: Array.isArray(oldData.keywords) ? oldData.keywords : [],
        searchTerms: Array.isArray(oldData.searchTerms) ? oldData.searchTerms : [],

        // Schema.org (fallback mínimo; puedes generarlo dinámicamente)
        schema: oldData.schema || {
            '@type': 'Product',
            name: title,
            description: metaDescription || oldData.description || '',
            image: image.src || '',
            sku: oldData.sku || '',
            brand: { '@type': 'Organization', name: oldData.brand || 'Repro Disseny' },
            offers: {
                '@type': 'Offer',
                price: Number.isFinite(oldData.price) ? oldData.price : 0,
                priceCurrency: oldData.priceCurrency || 'EUR',
                availability: (typeof oldData.inStock === 'boolean' ? oldData.inStock : true)
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock'
            }
        }
    };

    return sortFM(data);
}

async function walk(dir) {
    const out = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) out.push(...await walk(full));
        else if (e.isFile() && full.endsWith('.md')) out.push(full);
    }
    return out;
}

async function processFile(file) {
    const raw = await fs.readFile(file, 'utf8');
    const { content, data: oldData } = matter(raw);
    const newData = buildData(oldData, file);
    const serialized = matter.stringify(content.trim() + '\n', newData);
    if (serialized !== raw) {
        if (!dryRun) await fs.writeFile(file, serialized, 'utf8');
        console.log(`${dryRun ? '[DRY-RUN]' : '✅'} ${path.relative(root, file)} ${dryRun ? 'sería refactorizado' : 'refactorizado'}`);
        return file;
    } else {
        console.log(`👌 ${path.relative(root, file)} ya está actualizado.`);
        return null;
    }
}

async function run() {
    console.log(`🔍 Escaneando ${config.baseDir}`);
    if (!fss.existsSync(config.baseDir)) {
        console.error(`❌ No existe ${config.baseDir}`);
        process.exit(1);
    }
    const files = await walk(config.baseDir);
    const changed = [];
    for (const f of files) {
        try {
            const c = await processFile(f);
            if (c) changed.push(c);
        } catch (e) {
            console.error(`❌ Error en ${f}:`, e);
        }
    }
    if (!dryRun && changed.length) {
        await fs.mkdir(path.dirname(config.logPath), { recursive: true });
        await fs.writeFile(config.logPath, changed.join('\n'), 'utf8');
        console.log(`\n📝 Log en ${config.logPath}`);
    }
    console.log(`\n🏁 Hecho. ${changed.length} archivo(s) ${dryRun ? 'serían' : 'fueron'} modificados.`);
}
run();
