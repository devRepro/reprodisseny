import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const basePath = 'content/categorias'

const defaultFields = {
  categoria: {
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    searchTerms: '',
    image: '/img/category/mockuopweb.webp',
    galleryImages: [],
    alt: '',
    slug: '',
    schemaType: 'CollectionPage',
    featured: false,
    order: 0,
    type: 'categoria'
  },
  producto: {
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    searchTerms: '',
    image: '/img/product/mockupProduct.webp',
    galleryImages: [],
    alt: '',
    slug: '',
    category: '',
    sku: '',
    price: 0.0,
    brand: '',
    inStock: true,
    formFields: [],
    ratingValue: 0,
    reviewCount: 0,
    schemaType: 'Product',
    type: 'producto'
  }
}

function walk(dir) {
  let files = []
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      files = [...files, ...walk(fullPath)]
    } else if (file.endsWith('.md')) {
      files.push(fullPath)
    }
  }
  return files
}

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const { data, content: body } = matter(content)
  const filename = path.basename(filePath)
  const parentFolder = path.basename(path.dirname(filePath))

  const isCategory = filename === 'index.md'
  const type = isCategory ? 'categoria' : 'producto'
  const defaults = defaultFields[type]

  if (!isCategory) {
    defaults.slug = filename.replace('.md', '')
    defaults.category = parentFolder
  }

  const newData = {
    ...defaults,
    ...data,
    type,
  }

  const newContent = matter.stringify(body.trim(), newData)
  fs.writeFileSync(filePath, newContent, 'utf-8')
  console.log(`✔ Arreglado: ${filePath}`)
}

walk(basePath).forEach(fixFile)

