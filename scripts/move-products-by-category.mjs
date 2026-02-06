#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";

const ROOT = process.cwd();
const PRODUCTS_DIR = path.join(ROOT, "content", "productos");

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run") || args.has("-n");

const exists = async (p) => {
    try { await fs.access(p); return true; } catch { return false; }
};

const sanitize = (s) =>
    String(s || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-_]/g, "");

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

async function main() {
    const files = await fg(
        [path.join(PRODUCTS_DIR, "*.md"), path.join(PRODUCTS_DIR, "*.mdx")],
        {
            onlyFiles: true,
            unique: true,
            dot: false,
            ignore: ["**/*.bak", "**/*.bak.*", "**/*.tmp"],
        }
    );

    if (!files.length) {
        console.log("No hay ficheros para mover en content/productos/*.md");
        return;
    }

    console.log(`Encontrados ${files.length} productos en raíz.`);
    if (DRY_RUN) console.log("Modo: DRY RUN (no se moverá nada)\n");

    let moved = 0;
    let missing = 0;

    for (const absFile of files) {
        const rel = path.relative(ROOT, absFile);
        const raw = await fs.readFile(absFile, "utf8");
        const { data } = matter(raw);

        const categorySlug = sanitize(data?.categorySlug);
        const folder = categorySlug || "_sin_categoria";
        if (!categorySlug) missing++;

        const targetDir = path.join(PRODUCTS_DIR, folder);
        await ensureDir(targetDir);

        const target = await resolveCollision(path.join(targetDir, path.basename(absFile)));
        const relTarget = path.relative(ROOT, target);

        if (DRY_RUN) {
            console.log(`MOVE ${rel}  ->  ${relTarget}`);
            moved++;
            continue;
        }

        await fs.rename(absFile, target);
        console.log(`MOVED ${rel}  ->  ${relTarget}`);
        moved++;
    }

    console.log("\nResumen:");
    console.log(`  Movidos: ${moved}`);
    console.log(`  Sin categorySlug: ${missing} (carpeta: content/productos/_sin_categoria)`);
}

main().catch((err) => {
    console.error("\nERROR:", err?.stack || err?.message || err);
    process.exit(1);
});
