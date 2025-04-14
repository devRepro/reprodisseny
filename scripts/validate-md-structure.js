// scripts/validate-md-structure.js
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import matter from 'gray-matter'

const requiredFields = ['title', 'description', 'type', 'slug', 'image', 'alt']
const basePath = 'content/categorias'

const walk = (dir) => {
  let results = []
  const list = readdirSync(dir)

  list.forEach((file) => {
    const fullPath = join(dir, file)
    const stat = statSync(fullPath)

    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath))
    } else if (extname(fullPath) === '.md') {
      results.push(fullPath)
    }
  })

  return results
}

const validateFile = (filePath) => {
  const content = readFileSync(filePath, 'utf-8')
  const { data } = matter(content)

  const missingFields = requiredFields.filter((field) => !data[field])
  const type = data?.type

  return {
    filePath,
    type,
    valid: missingFields.length === 0,
    missingFields,
  }
}

const run = () => {
  const files = walk(basePath)
  const results = files.map(validateFile)

  const invalid = results.filter((r) => !r.valid)

  if (invalid.length === 0) {
    console.log('✅ Todos los archivos `.md` están correctamente estructurados.')
  } else {
    console.warn(`❌ Se encontraron ${invalid.length} archivos con errores:`)
    invalid.forEach(({ filePath, missingFields, type }) => {
      console.warn(`- ${filePath} [type: ${type || '❓'}]`)
      console.warn(`  Campos faltantes: ${missingFields.join(', ')}`)
    })
  }
}

run()
