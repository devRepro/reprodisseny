// scripts/move-readmes-from-categorias-to-docs.js
const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

// Rutas base
const basePath = process.cwd()
const fromPath = path.join(basePath, 'content/categorias')
const toPath = path.join(basePath, 'content/docs')

// Asegurar que la carpeta destino existe
if (!fs.existsSync(toPath)) {
  fs.mkdirSync(toPath, { recursive: true })
}

// Buscar todos los README.md en content/categorias/**
const getAllReadmes = (dir) => {
  const entries = fs.readdirSync(dir)
  let readmes = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      readmes = readmes.concat(getAllReadmes(fullPath))
    } else if (entry.toLowerCase() === 'readme.md') {
      readmes.push(fullPath)
    }
  }

  return readmes
}

const readmes = getAllReadmes(fromPath)

readmes.forEach((filepath) => {
  const parentFolder = path.basename(path.dirname(filepath)) // nombre de categoría
  const newFilename = `${parentFolder.toLowerCase().replace(/\s+/g, '-')}.md`
  const newFilepath = path.join(toPath, newFilename)

  const fileContent = fs.readFileSync(filepath, 'utf8')
  const { data, content } = matter(fileContent)

  const updatedFrontmatter = {
    title: data.title || parentFolder,
    description: data.description || '',
  }

  const finalContent = matter.stringify(content, updatedFrontmatter)

  fs.writeFileSync(newFilepath, finalContent, 'utf8')

  console.log(`✅ ${filepath} → ${newFilepath}`)
})
