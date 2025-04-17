import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const categoriasDir = path.resolve('content/categorias')
const today = new Date().toISOString().slice(0, 10)

function toTitleCase(str) {
  return str.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function extractTitle(content) {
  const match = content.match(/^#\s+(.+)/m)
  return match ? match[1].trim() : null
}

function extractDescription(content) {
  const lines = content.split('\n')
  const start = lines.findIndex(l => l.trim().startsWith('#'))
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line && !line.startsWith('#')) return line
  }
  return ''
}

function validateFrontmatter(data, content, filePath) {
  let changed = false
  const fileName = path.basename(filePath)

  if (!data.title) {
    data.title = extractTitle(content) || toTitleCase(fileName.replace('.md', ''))
    changed = true
  }

  if (!data.description) {
    data.description = extractDescription(content)
    changed = true
  }

  if (!data.type) {
    data.type = fileName === 'index.md' ? 'categoria' : 'producto'
    changed = true
  }

  if (data.type === 'categoria') {
    if (!data.schemaType) {
      data.schemaType = 'CollectionPage'
      changed = true
    }

    if (!data.nav && data.title) {
      data.nav = data.title.split('|')[0].trim()
      changed = true
    }

    if (typeof data.ratingValue === 'undefined') {
      data.ratingValue = 0
      changed = true
    }

    if (typeof data.reviewCount === 'undefined') {
      data.reviewCount = 0
      changed = true
    }
  }

  return changed
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

function validateFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const { content, data } = matter(raw)

  const changed = validateFrontmatter(data, content, filePath)

  if (changed) {
    const newRaw = matter.stringify(content, data)
    fs.writeFileSync(filePath, newRaw, 'utf8')
    console.log(`✅ Corregido: ${filePath}`)
  } else {
    console.log(`✔️  OK: ${filePath}`)
  }
}

function run() {
  const files = walk(categoriasDir).filter(f => f.endsWith('.md'))

  if (!files.length) {
    console.log('⚠️ No se encontraron archivos en content/categorias/')
    return
  }

  console.log(`🔍 Validando ${files.length} archivos:`)
  files.forEach(validateFile)
  console.log('🏁 Validación completa.')
}

run()
