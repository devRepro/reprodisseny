# 🛠 Documentación de Scripts del Proyecto

Esta documentación cubre los scripts personalizados utilizados para automatizar tareas de contenido en el proyecto **ReproDisseny**.
---

## 📁 Ubicación: `scripts/`

Contiene herramientas para generar y validar contenido en formato Markdown (`.md`) para el sitio web basado en Nuxt 3 + @nuxt/content.

---

## 📦 `create-product-files.js`

Genera archivos `.md` de productos a partir de un Excel (`productos.xlsx`) o un JSON (`products.json`).

- Entrada:
  - `scripts/productos.xlsx`
  - o `scripts/products.json`
- Salida:
  - Archivos `.md` en `content/categorias/[categoria]/[slug].md`

**Uso:**
```bash
npm run generate:products
```

---

## 🧼 `validateCategorias.js`

Valida y corrige automáticamente los archivos `.md` de categorías en `content/categorias/[categoria]/categoria/index.md`. Asegura campos mínimos (`title`, `description`, `type`) y estructura coherente para SEO y navegación.

**Uso:**
```bash
npm run validate:categorias
```

---

## 🧪 `validate-products.js`

Revisa y corrige archivos `.md` de productos dentro de `content/categorias/[categoria]/`. Añade campos estructurados faltantes según plantilla optimizada y completa datos básicos (`slug`, `metaTitle`, `metaDescription`, `schema`, etc.).

**Uso:**
```bash
npm run validate:products
```

---

## 🛠 Comandos en `package.json`

```json
"scripts": {
  "validate-md": "node scripts/validate-md-structure.js",
  "validate:categorias": "node scripts/validateCategorias.js",
  "validate-md-seo": "node scripts/validate-md-seo.js",
  "validate:products": "node scripts/validate-products.js",
  "validate:all": "npm run validate-md && npm run validate-md-seo && npm run validate:categorias && npm run validate:products",
  "generate:products": "node scripts/create-product-files.js"
}
```

---

> Última revisión: abril 2025

