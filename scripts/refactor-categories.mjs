import fs from 'node:fs/promises';
import fss from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const config = {
    baseDir: path.join(root, 'content/categorias'),
    baseUrl: 'https://reprodisseny.com',
    logPath: path.join(root, 'logs/refactored-categories.txt'),
};

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

const ORDER = [
    'type',
    // Básicos y navegación
    'title', 'nav', 'order', 'parent', 'featured', 'hidden',
    // Contenido / UX
    'description', 'image', 'alt', 'galleryImages', 'breadcrumbs', 'cta',
    // SEO
    'metaTitle', 'metaDescription', 'canonical', 'hreflang', 'keywords', 'searchTerms', 'faqs',
    // Schema.org
    'schema'
];

const sortFM = (obj) => {
    const out = {};
    for (const k of ORDER) if (k in obj) out[k] = obj[k];
    for (const k of Object.keys(obj)) if (!(k in out)) out[k] = obj[k];
    return out;
};

const toTitle = (s) => (s || '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

function normalizeImage(img) {
    if (!img) return { src: '', width: 1200, height: 800 };
    if (typeof img === 'string') {
        return { src: img.startsWith('/') ? img : `/img/categorias/${img}`, width: 1200, height: 800 };
    }
    return {
        src: img.src || '',
        width: img.width ?? 1200,
        height: img.height ?? 800
    };
}

function parentFromPath(baseDir, file) {
    const rel = path.relative(baseDir, file);
    const parts = path.dirname(rel).split(path.sep).filter(Boolean);
    return parts.length ? parts.at(-1) : '';
}

function ensureHreflang(list, canonical) {
    const src = Array.isArray(list) ? list.filter(x => x && x.lang && x.url) : [];
    if (canonical && !src.some(x => x.lang === 'es-ES')) src.push({ lang: 'es-ES', url: canonical });
    return src;
}

async function walk(dir) {
    const out = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) out.push(...await walk(full));
        else if (e.isFile() && full.endsWith('.md')) out.push(full); // ajusta si tienes .yml/.yaml
    }
    return out;
}

function buildData(oldData, filePath) {
    const slug = oldData.slug || path.basename(filePath, '.md');
    const parent = oldData.parent || parentFromPath(config.baseDir, filePath);
    const title = oldData.title || toTitle(slug);
    const canonical = oldData.canonical || `${config.baseUrl}/categorias/${slug}`;

    const data = {
        type: 'categoria',

        // Básicos
        title,
        nav: oldData.nav || title,
        order: Number.isFinite(oldData.order) ? oldData.order : 0,
        parent,
        featured: !!oldData.featured,
        hidden: !!oldData.hidden,

        // Contenido / UX
        description: oldData.description || '',
        image: normalizeImage(oldData.image),
        alt: oldData.alt || `Imagen de ${title}`,
        galleryImages: Array.isArray(oldData.galleryImages) ? oldData.galleryImages : [],
        breadcrumbs: Array.isArray(oldData.breadcrumbs) && oldData.breadcrumbs.length
            ? oldData.breadcrumbs
            : [
                { name: 'Inicio', url: '/' },
                ...(parent ? [{ name: toTitle(parent), url: `/categorias/${parent}` }] : []),
                { name: title, url: `/categorias/${slug}` }
            ],
        cta: oldData.cta || { text: 'Ver Productos', link: '#productos' },

        // SEO (camelCase + compat con claves antiguas)
        metaTitle: oldData.metaTitle || oldData.metatitle || `${title} | ${oldData.brand || 'Repro Disseny'}`,
        metaDescription: oldData.metaDescription || oldData.metadescription || oldData.description || '',
        canonical,
        hreflang: ensureHreflang(oldData.hreflang, canonical),
        keywords: Array.isArray(oldData.keywords) ? oldData.keywords : [],
        searchTerms: Array.isArray(oldData.searchTerms) ? oldData.searchTerms : [],
        faqs: Array.isArray(oldData.faqs) ? oldData.faqs : [],

        // Schema.org
        schema: oldData.schema || {
            '@type': 'CollectionPage',
            name: oldData.metaTitle || title,
            description: oldData.metaDescription || oldData.description || ''
        }
    };

    return sortFM(data);
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
