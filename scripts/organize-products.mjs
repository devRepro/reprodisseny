#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";

const ROOT = process.cwd();
const PRODUCTS_DIR = path.join(ROOT, "content", "productos");

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run") || args.has("-n");
const VERBOSE = args.has("--verbose") || args.has("-v");

const exists = async (p) => {
    try { await fs.access(p); return true; } catch { return false; }
};

// slugify suave (mantiene guiones, convierte espacios, quita chars raros)
const slugify = (s) =>
    String(s || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // quita acentos
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-_]/g, "")
        .replace(/-+/g, "-")
        .replace(/^[-_]+|[-_]+$/g, "");

const ensureDir = (dir) => fs.mkdir(dir, { recursive: true });

const resolveCollision = async (targetPath) => {
    if (!(await exists(targetPath))) return targetPath;

    const dir = path.dirname(targetPath);
    const ext = path.extname(targetPath);
    const base = path.basename(targetPath, ext);

    for (let i = 2; i < 999; i++) {
        const c = path.join(dir, `${base}-${i}${ext}`);
        if (!(await exists(c))) return c;
    }
    throw new Error(`Demasiadas colisiones para: ${targetPath}`);
};

function desiredFolderFromFrontmatter(data) {
    const type = String(data?.type || "").trim().toLowerCase();

    // Si no es producto pero tiene categorySlug, igual lo tratamos como producto
    const categorySlug = slugify(data?.categorySlug);
    const subcategorySlug = slugify(data?.subcategorySlug);

    if (!categorySlug) return "_sin_categoria";

    // /content/productos/<category>/<subcat?>
    return subcategorySlug ? path.join(categorySlug, subcategorySlug) : categorySlug;
}

async function main() {
    const files = await fg(
        [path.join(PRODUCTS_DIR, "**/*.md"), path.join(PRODUCTS_DIR, "**/*.mdx")],
        {
            onlyFiles: true,
            unique: true,
            dot: false,
            ignore: ["**/*.bak", "**/*.bak.*", "**/*.tmp", "**/.*"],
        }
    );

    if (!files.length) {
        console.log("No hay productos en content/productos/**/*.(md|mdx)");
        return;
    }

    console.log(`Encontrados ${files.length} ficheros en content/productos/**.`);
    if (DRY_RUN) console.log("Modo: DRY RUN (no se moverá nada)\n");

    let moved = 0;
    let ok = 0;
    let missing = 0;
    let skippedNonProduct = 0;
    let failed = 0;

    for (const absFile of files) {
        const rel = path.relative(ROOT, absFile);

        let raw;
        try {
            raw = await fs.readFile(absFile, "utf8");
        } catch (e) {
            failed++;
            console.log(`FAIL (read): ${rel}`);
            if (VERBOSE) console.log(e);
            continue;
        }

        let parsed;
        try {
            parsed = matter(raw);
        } catch (e) {
            failed++;
            console.log(`FAIL (frontmatter): ${rel}`);
            if (VERBOSE) console.log(e);
            continue;
        }

        const data = parsed.data || {};
        const hasCategory = !!String(data?.categorySlug || "").trim();
        const isProduct = String(data?.type || "").trim().toLowerCase() === "producto";

        // Si no parece producto y no tiene categorySlug, no tocamos
        if (!isProduct && !hasCategory) {
            skippedNonProduct++;
            if (VERBOSE) console.log(`SKIP (no producto / sin categorySlug): ${rel}`);
            continue;
        }

        const folderRel = desiredFolderFromFrontmatter(data);
        if (folderRel === "_sin_categoria") missing++;

        const targetDir = path.join(PRODUCTS_DIR, folderRel);
        await ensureDir(targetDir);

        // Mantenemos el nombre de archivo actual (no renombramos a slug automáticamente)
        const targetInitial = path.join(targetDir, path.basename(absFile));
        const target = await resolveCollision(targetInitial);

        const currentDir = path.dirname(absFile);
        const desiredDirAbs = targetDir;

        // Si ya está en el directorio correcto y mismo basename, OK
        if (
            path.resolve(currentDir) === path.resolve(desiredDirAbs) &&
            path.basename(absFile) === path.basename(targetInitial)
        ) {
            ok++;
            continue;
        }

        const relTarget = path.relative(ROOT, target);

        if (DRY_RUN) {
            console.log(`MOVE ${rel}  ->  ${relTarget}`);
            moved++;
            continue;
        }

        try {
            await fs.rename(absFile, target);
            console.log(`MOVED ${rel}  ->  ${relTarget}`);
            moved++;
        } catch (e) {
            failed++;
            console.log(`FAIL (move): ${rel}  ->  ${relTarget}`);
            if (VERBOSE) console.log(e);
        }
    }

    console.log("\nResumen:");
    console.log(`  Ya OK: ${ok}`);
    console.log(`  Movidos: ${moved}`);
    console.log(`  Sin categorySlug: ${missing} (carpeta: content/productos/_sin_categoria)`);
    console.log(`  Skip no-producto: ${skippedNonProduct}`);
    console.log(`  Fallos: ${failed}`);

    if (DRY_RUN) {
        console.log("\nSi el plan te cuadra, ejecuta sin --dry-run para aplicar.");
    }
}

main().catch((err) => {
    console.error("\nERROR:", err?.stack || err?.message || err);
    process.exit(1);
});
