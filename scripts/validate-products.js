import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const baseDir = path.resolve('content/categorias')

function walk(dir) {
  let files = []
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      files = files.concat(walk(fullPath))
    } else if (file.endsWith('.md') && file !== 'index.md') {
      files.push(fullPath)
    }
  }
  return files
}

function validateProduct(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const { content, data } = matter(raw)

  const name = path.basename(filePath, '.md')

  // Detecta si el archivo está en una subcategoría (dos niveles dentro de /categorias)
  const relativeDir = path.relative(baseDir, path.dirname(filePath))
  const parts = relativeDir.split(path.sep)

  let correctCategory = parts.length > 1 ? parts[1] : parts[0] // subcategoría o categoría directa

  let changed = false

  const defaults = {
    nav: data.title || name,
    metaTitle: data.title || name,
    metaDescription: data.description || '',
    keywords: [],
    searchTerms: [],
    galleryImages: [],
    alt: data.title || name,
    category: correctCategory,
    slug: name,
    sku: '',
    price: 0,
    priceCurrency: 'EUR',
    brand: 'Repro Disseny',
    inStock: true,
    formFields: [],
    ratingValue: 0,
    reviewCount: 0,
    type: 'producto'
  }

  // Verifica y actualiza campos faltantes
  for (const key in defaults) {
    if (!(key in data)) {
      data[key] = defaults[key]
      changed = true
    }
  }

  // Verifica si la categoría está incorrecta
  if (data.category !== correctCategory) {
    console.log(`🔁 Corrigiendo category: ${data.category} → ${correctCategory} en ${filePath}`)
    data.category = correctCategory
    changed = true
  }

  // Actualiza schema
  data.schema = {
    '@type': 'Product',
    name: data.title,
    description: data.description || '',
    image: `https://reprodisseny.com${data.image || ''}`,
    sku: data.sku || '',
    brand: {
      '@type': 'Organization',
      name: 'Repro Disseny'
    },
    offers: {
      '@type': 'Offer',
      price: data.price || 0,
      priceCurrency: data.priceCurrency || 'EUR',
      availability: 'https://schema.org/InStock'
    }
  }

  if (changed) {
    const newRaw = matter.stringify(content, data)
    fs.writeFileSync(filePath, newRaw, 'utf8')
    console.log(`✅ Arreglado: ${filePath}`)
  } else {
    console.log(`✔️  OK: ${filePath}`)
  }
}

function run() {
  const productFiles = walk(baseDir)
  console.log(`🔍 Validando ${productFiles.length} productos:`)
  productFiles.forEach(validateProduct)
  console.log('🏁 Validación completa.')
}

run()
