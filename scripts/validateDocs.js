// scripts/validateDocsFinal.js
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const docsDir = path.resolve('content/docs')
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

function validateFrontmatter(data, content, fileName) {
  let changed = false

  if (!data.title) {
    data.title = extractTitle(content) || toTitleCase(fileName.replace('.md', ''))
    console.log(`📝 Añadido title: "${data.title}"`)
    changed = true
  }

  if (!data.description) {
    data.description = extractDescription(content)
    console.log(`📝 Añadido description: "${data.description}"`)
    changed = true
  }

  if (data.type !== 'doc') {
    data.type = 'doc'
    changed = true
  }

  if (data.private !== true) {
    data.private = true
    changed = true
  }

  if (!data.createdAt) {
    data.createdAt = today
    changed = true
  }

  // Actualizamos siempre
  data.updatedAt = today

  if (!('toc' in data)) {
    data.toc = true
    changed = true
  }

  if (!data.head || !Array.isArray(data.head.meta)) {
    data.head = {
      meta: [{ name: 'robots', content: 'noindex, nofollow' }]
    }
    changed = true
  }

  return changed
}

function validateFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const { content, data } = matter(raw)
  const fileName = path.basename(filePath)

  const changed = validateFrontmatter(data, content, fileName)

  if (changed) {
    const newRaw = matter.stringify(content, data)
    fs.writeFileSync(filePath, newRaw, 'utf8')
    console.log(`✅ Corregido: ${fileName}`)
  } else {
    console.log(`✔️  OK: ${fileName}`)
  }
}

function run() {
  const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'))

  if (!files.length) {
    console.log('⚠️ No se encontraron archivos en content/docs/')
    return
  }

  console.log(`🔍 Validando ${files.length} archivos:`)
  files.forEach(file => validateFile(path.join(docsDir, file)))
  console.log('🏁 Validación completa.')
}

run()
