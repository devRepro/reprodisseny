import { promises as fsPromises, existsSync } from 'fs'
import path from 'path'
import ExcelJS from 'exceljs'

const basePath = './content/categorias'
const excelPath = './scripts/productos.xlsx'
const jsonPath = './scripts/products.json'

async function loadProductsFromExcel(filePath) {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(filePath)
  const worksheet = workbook.worksheets[0]
  const headers = worksheet.getRow(1).values.slice(1)

  const products = []

  worksheet.eachRow((row, rowIndex) => {
    if (rowIndex === 1) return
    const values = row.values.slice(1)
    const product = {}
    headers.forEach((key, index) => {
      product[key] = values[index]
    })
    products.push(product)
  })

  return products
}

const template = (p) => `---
title: ${JSON.stringify(p.title || '')}
metaTitle: ${JSON.stringify(p.metaTitle || p.title || '')}
metaDescription: ${JSON.stringify(p.metaDescription || '')}
description: ${JSON.stringify(p.description || '')}
keywords: ${JSON.stringify(p.keywords || [])}
searchTerms: ${JSON.stringify(p.searchTerms || [])}
image: ${JSON.stringify(p.image || '')}
galleryImages: ${JSON.stringify(p.galleryImages || [])}
alt: ${JSON.stringify(p.alt || '')}
slug: ${JSON.stringify(p.slug || '')}
category: ${JSON.stringify(p.category || '')}
sku: ${JSON.stringify(p.sku || '')}
brand: ${JSON.stringify(p.brand || 'Repro Disseny')}
formFields: ${JSON.stringify(p.formFields || [])}
type: 'producto'
---

## ${p.title || 'Título del producto'}

${p.body || 'Descripción clara, atractiva y optimizada para buscadores.'}
`

const run = async () => {
  let products = []

  if (existsSync(excelPath)) {
    products = await loadProductsFromExcel(excelPath)
    console.log(`📗 Productos cargados desde Excel: ${products.length}`)
  } else if (existsSync(jsonPath)) {
    const json = await fsPromises.readFile(jsonPath, 'utf-8')
    products = JSON.parse(json)
    console.log(`📘 Productos cargados desde JSON: ${products.length}`)
  } else {
    console.error('❌ No se encontró ningún archivo de productos (productos.xlsx o products.json)')
    process.exit(1)
  }

  for (const product of products) {
    const productDir = path.join(basePath, product.category)
    const productPath = path.join(productDir, `${product.slug}.md`)
    await fsPromises.mkdir(productDir, { recursive: true })
    await fsPromises.writeFile(productPath, template(product), 'utf-8')
    console.log(`✅ Producto generado: ${productPath}`)
  }
}

run()
