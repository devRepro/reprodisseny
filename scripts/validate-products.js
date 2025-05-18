// validate-products.js
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

// --- Configuración base ---
const baseDir = path.resolve('content/categorias')
const defaultImage = '/img/productos/mockupProduct.webp'
const defaultBrand = 'Reprodisseny'
const defaultCurrency = 'EUR'
const logPath = path.resolve('logs/changed-products.txt')

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const changedFiles = []

/**
 * Convierte texto tipo 'arbol-navidad' a 'Arbol Navidad'
 */
function toTitleCase(str) {
  return str.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

/**
 * Extrae el primer # título del contenido Markdown
 */
function extractTitle(content) {
  const match = content.match(/^#\s+(.+)/m)
  return match ? match[1].trim() : null
}

/**
 * Extrae la primera línea de texto útil del cuerpo
 */
function extractDescription(content) {
  const lines = content.split('\n')
  let inCode = false, inFrontmatter = true
  for (const line of lines) {
    if (line.trim() === '---') {
      inFrontmatter = !inFrontmatter
      continue
    }
    if (inFrontmatter) continue
    if (line.trim().startsWith('```')) {
      inCode = !inCode
      continue
    }
    if (inCode) continue
    const trimmed = line.trim()
    if (trimmed && !/^([#\-*`!<\[])/.test(trimmed)) return trimmed
  }
  return ''
}

/**
 * Ordena las claves del frontmatter para mantener consistencia
 */
function sortFrontmatter(data) {
  const preferredOrder = [
    'title', 'metaTitle', 'metaDescription', 'keywords', 'searchTerms',
    'image', 'galleryImages', 'alt', 'slug', 'category', 'sku', 'price',
    'priceCurrency', 'brand', 'inStock', 'formFields', 'ratingValue',
    'reviewCount', 'type', 'schema'
  ]
  return Object.fromEntries(
    Object.entries(data).sort((a, b) => {
      return preferredOrder.indexOf(a[0]) - preferredOrder.indexOf(b[0])
    })
  )
}

function walk(dir) {
  let files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...walk(fullPath))
    else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md')
      files.push(fullPath)
  }
  return files
}

function updateProduct(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const { content, data } = matter(raw)

  const slug = path.basename(filePath, '.md')
  const relDir = path.relative(baseDir, path.dirname(filePath))
  const parentCat = relDir.split(path.sep).filter(Boolean).pop() || 'sin-categoria'

  const newTitle = data.title || extractTitle(content) || toTitleCase(slug)
  const newDescription = data.description || extractDescription(content)

  const updated = {
    title: newTitle,
    metaTitle: data.metaTitle || newTitle,
    metaDescription: data.metaDescription || newDescription,
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    searchTerms: Array.isArray(data.searchTerms) ? data.searchTerms : [],
    image: data.image || defaultImage,
    galleryImages: Array.isArray(data.galleryImages) ? data.galleryImages : [],
    alt: data.alt || `Imagen de ${newTitle}`,
    slug,
    category: parentCat,
    sku: data.sku || '',
    price: typeof data.price === 'number' ? data.price : 0,
    priceCurrency: data.priceCurrency || defaultCurrency,
    brand: data.brand || defaultBrand,
    inStock: typeof data.inStock === 'boolean' ? data.inStock : true,
    formFields: Array.isArray(data.formFields) ? data.formFields : [],
    ratingValue: typeof data.ratingValue === 'number' ? data.ratingValue : 0,
    reviewCount: typeof data.reviewCount === 'number' ? data.reviewCount : 0,
    type: 'producto',
    schema: {
      '@type': 'Product',
      name: newTitle,
      description: newDescription,
      image: `https://reprodisseny.com${data.image || defaultImage}`,
      sku: data.sku || '',
      brand: { '@type': 'Organization', name: data.brand || defaultBrand },
      offers: {
        '@type': 'Offer',
        price: typeof data.price === 'number' ? data.price : 0,
        priceCurrency: data.priceCurrency || defaultCurrency,
        availability: (data.inStock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock')
      }
    }
  }

  const serialized = matter.stringify(content, sortFrontmatter(updated))
  if (!dryRun) {
    fs.writeFileSync(filePath, serialized, 'utf8')
  }
  changedFiles.push(filePath)
  console.log(`${dryRun ? '[DRY-RUN]' : '✅'} ${filePath} ${dryRun ? 'sería actualizado' : 'actualizado y optimizado'}`)
}

function run() {
  console.log(`🔍 Buscando productos en ${baseDir}...`)
  const files = walk(baseDir)
  files.forEach(file => {
    try {
      const raw = fs.readFileSync(file, 'utf8')
      const { data } = matter(raw)
      if (data.type === 'producto') updateProduct(file)
    } catch (err) {
      console.error(`❌ Error en archivo ${file}:`, err.message)
    }
  })

  if (!dryRun && changedFiles.length > 0) {
    fs.mkdirSync(path.dirname(logPath), { recursive: true })
    fs.writeFileSync(logPath, changedFiles.join('\n'), 'utf8')
    console.log(`📝 Log generado en ${logPath}`)
  }
  console.log('🏁 Proceso completado.')
}

run()
