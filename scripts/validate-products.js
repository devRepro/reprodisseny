import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Directorio base de las categorías/productos
const baseDir = path.resolve('content/categorias');

// --- Funciones de Ayuda (Revisadas) ---

/**
 * Convierte una cadena con guiones/guiones bajos a Title Case.
 * @param {string} str - Cadena de entrada.
 * @returns {string} Cadena en Title Case.
 */
function toTitleCase(str) {
  if (!str) return '';
  return str.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Intenta extraer el primer encabezado H1 del contenido Markdown.
 * @param {string} content - Contenido Markdown.
 * @returns {string | null} Título extraído o null si no se encuentra.
 */
function extractTitleFromContent(content) {
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : null;
}

/**
 * Intenta extraer la primera línea de párrafo significativa del contenido Markdown después del frontmatter.
 * @param {string} content - Contenido Markdown.
 * @returns {string} Descripción extraída o cadena vacía.
 */
function extractDescriptionFromContent(content) {
    const lines = content.split('\n');
    let inCodeBlock = false;
    let inFrontmatter = true; // Inicialmente estamos en el frontmatter

    for (const line of lines) {
        if (line.trim() === '---') {
            inFrontmatter = !inFrontmatter;
            continue; // Saltar la línea de guiones
        }
        if (inFrontmatter) continue; // Saltar líneas dentro del frontmatter

        // Manejar bloques de código para saltarlos
        if (line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            continue;
        }
        if (inCodeBlock) continue;

        const trimmedLine = line.trim();
        // Buscar la primera línea de texto que no sea un elemento de bloque Markdown común
        if (trimmedLine && !trimmedLine.startsWith('#') && !trimmedLine.startsWith('>') && !trimmedLine.startsWith('-') && !trimmedLine.startsWith('*') && !trimmedLine.startsWith('`') && !trimmedLine.startsWith('[') && !trimmedLine.startsWith('!') && !trimmedLine.startsWith('<')) {
           return trimmedLine;
        }
    }
    return '';
}


// --- Lógica de Validación y Autofill ---

/**
 * Valida y corrige el frontmatter de un archivo .md de producto.
 * @param {object} data - Objeto del frontmatter (por referencia, se modifica).
 * @param {string} content - Contenido Markdown del archivo.
 * @param {string} filePath - Ruta completa del archivo.
 * @returns {boolean} True si se realizaron cambios, False en caso contrario.
 */
function validateAndAutofillProduct(data, content, filePath) {
  let changed = false;
  const fileName = path.basename(filePath, '.md'); // slug del archivo sin .md

  // Obtener la ruta relativa del directorio padre del archivo
  const parentDir = path.dirname(filePath);
  const relativeParentDir = path.relative(baseDir, parentDir); // ej: 'adhesivos' o 'adhesivos/etiquetas'

  // El slug de la categoría padre es el último segmento del directorio padre relativo
  const parentSegments = relativeParentDir.split(path.sep).filter(Boolean);
  const correctCategorySlug = parentSegments.length > 0 ? parentSegments[parentSegments.length - 1] : null; // Null si está directo en content/categorias (no debería pasar para productos)

  // Determinar el path esperado
  const fullPath = '/categorias/' + relativeParentDir + '/' + fileName;


  // --- Validaciones y Autofill ---

  // type (Debe ser 'producto')
  if (data.type !== 'producto') {
    console.log(`   🔧 Tipo incorrecto: '${data.type}' -> 'producto' en ${filePath}`);
    data.type = 'producto';
    changed = true;
  }

  // slug (Debe coincidir con el nombre del archivo sin extensión)
  if (data.slug !== fileName) {
    console.log(`   🔧 Slug incorrecto: '${data.slug}' -> '${fileName}' en ${filePath}`);
    data.slug = fileName;
    changed = true;
  }

  // path (Debe coincidir con /categorias/ + ruta relativa + slug)
   if (data.path !== fullPath) {
       console.log(`   🔧 Path incorrecto: '${data.path}' -> '${fullPath}' en ${filePath}`);
       data.path = fullPath;
       changed = true;
   }


  // category (Debe ser el slug de la carpeta padre inmediata)
  if (data.category !== correctCategorySlug) {
      console.log(`   🔧 Categoría padre incorrecta: '${data.category}' -> '${correctCategorySlug}' en ${filePath}`);
      data.category = correctCategorySlug;
      changed = true;
  }
   // Advertencia si no se pudo determinar la categoría (producto en raíz de categorias?)
   if (!correctCategorySlug) {
       console.warn(`   ⚠️ No se pudo determinar la categoría padre para el producto en ${filePath}. Verifique la estructura de carpetas.`);
   }


  // title (Obligatorio, autofill desde H1 o nombre de archivo)
  if (!data.title) {
    const titleFromContent = extractTitleFromContent(content);
    if (titleFromContent) {
        console.log(`   🔧 Título faltante: Autofill desde contenido -> '${titleFromContent}' en ${filePath}`);
        data.title = titleFromContent;
        changed = true;
    } else {
        const titleFromFileName = toTitleCase(fileName);
         console.log(`   🔧 Título faltante y sin H1: Autofill desde nombre de archivo -> '${titleFromFileName}' en ${filePath}`);
         data.title = titleFromFileName;
         changed = true;
    }
  }

   // nav (Autofill desde title si falta)
   if (!data.nav) {
       if (data.title) {
           const navFromTitle = data.title.split('|')[0].trim();
            console.log(`   🔧 Nav faltante: Autofill desde título -> '${navFromTitle}' en ${filePath}`);
            data.nav = navFromTitle;
            changed = true;
       } else {
            // Si title también falta, nav podría quedar vacío, lo cual es aceptable si nav es opcional.
           console.warn(`   ⚠️ Nav faltante y sin título para autofill en ${filePath}`);
       }
   }


   // description (Obligatorio, autofill desde contenido o dejar vacío con advertencia)
   if (!data.description) {
       const descFromContent = extractDescriptionFromContent(content);
       if (descFromContent) {
           console.log(`   🔧 Descripción faltante: Autofill desde contenido -> '${descFromContent.substring(0, 50)}...' en ${filePath}`);
           data.description = descFromContent;
           changed = true;
       } else {
           console.warn(`   ⚠️ Descripción faltante y sin párrafo en contenido en ${filePath}`);
       }
   }


   // Metadatos SEO (metatitle, metadescription, keywords) - Usar campos minúsculas de types
   // metatitle
   if (!data.metatitle) {
       if (data.title) {
           console.log(`   🔧 metatitle faltante: Autofill desde título -> '${data.title}' en ${filePath}`);
           data.metatitle = data.title;
           changed = true;
       } else {
           console.warn(`   ⚠️ metatitle faltante y sin título para autofill en ${filePath}`);
       }
   }
   // metadescription
   if (!data.metadescription) {
        if (data.description) {
           console.log(`   🔧 metadescription faltante: Autofill desde descripción -> '${data.description.substring(0, 50)}...' en ${filePath}`);
           data.metadescription = data.description;
           changed = true;
        } else {
            console.warn(`   ⚠️ metadescription faltante y sin descripción para autofill en ${filePath}`);
        }
   }
   // keywords (Asegurar que es un array, autofill con array vacío si falta)
   if (!data.keywords) {
       console.log(`   🔧 Keywords faltantes: Autofill con array vacío en ${filePath}`);
       data.keywords = [];
       changed = true;
   } else if (!Array.isArray(data.keywords)) {
        console.log(`   🔧 Keywords no es un array: Convirtiendo o reemplazando en ${filePath}`);
        // Intentar convertir si es string, o simplemente reemplazar con array vacío
        if (typeof data.keywords === 'string') {
            data.keywords = data.keywords.split(/, ?| ?; ?/).map(k => k.trim()).filter(Boolean);
            console.log(`     Convertido de string a array: ${data.keywords}`);
        } else {
            data.keywords = []; // Limpiar datos corruptos
        }
        changed = true;
   }


   // sku (Obligatorio en type Producto, autofill con '' si falta)
   if (!data.sku) {
       console.log(`   🔧 SKU faltante: Autofill con cadena vacía en ${filePath}`);
       data.sku = '';
       changed = true;
   }

   // price (Number opcional, autofill con 0 si falta, validar tipo si existe)
   if (typeof data.price === 'undefined') {
       console.log(`   🔧 Price faltante: Autofill con 0 en ${filePath}`);
       data.price = 0;
       changed = true;
   } else if (typeof data.price !== 'number') {
       console.warn(`   ⚠️ Price no es un número: '${data.price}' en ${filePath}. Intentando convertir o limpiar.`);
       const parsedPrice = parseFloat(data.price);
       if (!isNaN(parsedPrice)) {
            console.log(`     Convertido a número: ${parsedPrice}`);
            data.price = parsedPrice;
       } else {
            console.warn(`     No se pudo convertir. Limpiando a 0.`);
            data.price = 0; // Limpiar datos corruptos
       }
        changed = true;
   }

   // priceCurrency (String opcional, autofill con 'EUR' si falta)
   if (!data.priceCurrency) {
       console.log(`   🔧 priceCurrency faltante: Autofill con 'EUR' en ${filePath}`);
       data.priceCurrency = 'EUR';
       changed = true;
   } else if (typeof data.priceCurrency !== 'string') {
       console.warn(`   ⚠️ priceCurrency no es un string: '${data.priceCurrency}' en ${filePath}. Limpiando.`);
       data.priceCurrency = 'EUR'; // Limpiar datos corruptos
       changed = true;
   }


   // brand (String opcional, autofill con 'Repro Disseny' si falta)
   if (!data.brand) {
       console.log(`   🔧 Brand faltante: Autofill con 'Repro Disseny' en ${filePath}`);
       data.brand = 'Repro Disseny';
       changed = true;
   } else if (typeof data.brand !== 'string') {
        console.warn(`   ⚠️ Brand no es un string: '${data.brand}' en ${filePath}. Limpiando.`);
        data.brand = 'Repro Disseny'; // Limpiar datos corruptos
        changed = true;
   }


   // inStock (Boolean opcional, autofill con true si falta, validar tipo si existe)
   if (typeof data.inStock === 'undefined') {
       console.log(`   🔧 inStock faltante: Autofill con true en ${filePath}`);
       data.inStock = true;
       changed = true;
   } else if (typeof data.inStock !== 'boolean') {
       console.warn(`   ⚠️ inStock no es un boolean: '${data.inStock}' en ${filePath}. Intentando convertir o limpiar.`);
       if (data.inStock === 'true') { data.inStock = true; } // Convertir string 'true'
       else if (data.inStock === 'false') { data.inStock = false; } // Convertir string 'false'
       else { data.inStock = true; console.warn(`     No se pudo convertir. Limpiando a true.`); } // Limpiar datos corruptos
       changed = true;
   }


   // formFields (Array opcional, autofill con [] si falta, validar tipo si existe)
   if (!data.formFields) {
       console.log(`   🔧 formFields faltantes: Autofill con array vacío en ${filePath}`);
       data.formFields = [];
       changed = true;
   } else if (!Array.isArray(data.formFields)) {
       console.warn(`   ⚠️ formFields no es un array: Limpiando en ${filePath}.`);
       data.formFields = []; // Limpiar datos corruptos
       changed = true;
   } // Podrías añadir validación más profunda de la estructura de cada FormField si fuera necesario


   // ratingValue (Number opcional, autofill con 0 si falta, validar tipo si existe)
   if (typeof data.ratingValue === 'undefined') {
       console.log(`   🔧 ratingValue faltante: Autofill con 0 en ${filePath}`);
       data.ratingValue = 0;
       changed = true;
   } else if (typeof data.ratingValue !== 'number') {
        console.warn(`   ⚠️ ratingValue no es un número: '${data.ratingValue}' en ${filePath}. Intentando convertir o limpiar.`);
        const parsedValue = parseFloat(data.ratingValue);
        if (!isNaN(parsedValue)) {
             console.log(`     Convertido a número: ${parsedValue}`);
             data.ratingValue = parsedValue;
        } else {
             console.warn(`     No se pudo convertir. Limpiando a 0.`);
             data.ratingValue = 0; // Limpiar datos corruptos
        }
        changed = true;
   }


   // reviewCount (Number opcional, autofill con 0 si falta, validar tipo si existe)
   if (typeof data.reviewCount === 'undefined') {
       console.log(`   🔧 reviewCount faltante: Autofill con 0 en ${filePath}`);
       data.reviewCount = 0;
       changed = true;
   } else if (typeof data.reviewCount !== 'number') {
       console.warn(`   ⚠️ reviewCount no es un número: '${data.reviewCount}' en ${filePath}. Intentando convertir o limpiar.`);
        const parsedCount = parseInt(data.reviewCount, 10);
        if (!isNaN(parsedCount)) {
             console.log(`     Convertido a número entero: ${parsedCount}`);
             data.reviewCount = parsedCount;
        } else {
             console.warn(`     No se pudo convertir. Limpiando a 0.`);
             data.reviewCount = 0; // Limpiar datos corruptos
        }
        changed = true;
   }

    // tags (Array opcional, autofill con [] si falta, validar tipo si existe)
   if (!data.tags) {
       console.log(`   🔧 Tags faltantes: Autofill con array vacío en ${filePath}`);
       data.tags = [];
       changed = true;
   } else if (!Array.isArray(data.tags)) {
       console.warn(`   ⚠️ Tags no es un array: Limpiando en ${filePath}.`);
       data.tags = []; // Limpiar datos corruptos
       changed = true;
   }

    // searchTerms (Array opcional, autofill con [] si falta, validar tipo si existe)
   if (!data.searchTerms) {
       console.log(`   🔧 searchTerms faltantes: Autofill con array vacío en ${filePath}`);
       data.searchTerms = [];
       changed = true;
   } else if (!Array.isArray(data.searchTerms)) {
       console.warn(`   ⚠️ searchTerms no es un array: Limpiando en ${filePath}.`);
       data.searchTerms = []; // Limpiar datos corruptos
       changed = true;
   }

    // galleryImages (Array opcional, autofill con [] si falta, validar tipo si existe)
   if (!data.galleryImages) {
       console.log(`   🔧 galleryImages faltantes: Autofill con array vacío en ${filePath}`);
       data.galleryImages = [];
       changed = true;
   } else if (!Array.isArray(data.galleryImages)) {
       console.warn(`   ⚠️ galleryImages no es un array: Limpiando en ${filePath}.`);
       data.galleryImages = []; // Limpiar datos corruptos
       changed = true;
   }


   // faqs (Array de objetos opcional, autofill con [] si falta, validar estructura si existe)
   if (!data.faqs) {
       console.log(`   🔧 FAQs faltantes: Autofill con array vacío en ${filePath}`);
       data.faqs = [];
       changed = true;
   } else if (!Array.isArray(data.faqs)) {
       console.warn(`   ⚠️ FAQs no es un array: Limpiando en ${filePath}.`);
       data.faqs = []; // Limpiar datos corruptos
       changed = true;
   } else if (data.faqs.some(faq => !faq || typeof faq.question !== 'string' || typeof faq.answer !== 'string')) {
       console.warn(`   ⚠️ FAQs contiene elementos con formato incorrecto en ${filePath}. Filtrando o limpiando.`);
       // Intentar filtrar elementos malformados
       const validFaqs = data.faqs.filter(faq => faq && typeof faq.question === 'string' && typeof faq.answer === 'string');
        if (validFaqs.length < data.faqs.length) {
            console.log(`     Filtrados ${data.faqs.length - validFaqs.length} FAQs malformados.`);
            data.faqs = validFaqs;
            changed = true;
        }
   }


  // schema (Objeto opcional, validar estructura si existe o regenerar si falta/es inválido)
   if (!data.schema || typeof data.schema !== 'object' || data.schema === null || Array.isArray(data.schema) || data.schema['@type'] !== 'Product') {
       // Regenerar schema si falta o es incorrecto para un producto
       console.log(`   🔧 Schema faltante o incorrecto para Producto. Regenerando en ${filePath}`);
       data.schema = {
           '@type': 'Product',
           name: data.title || fileName, // Usar título o nombre de archivo
           description: data.description || '',
           image: data.image ? `https://reprodisseny.com${data.image.startsWith('/') ? data.image : '/' + data.image}` : '', // Ruta completa de la imagen
           sku: data.sku || '',
           brand: data.brand ? { '@type': 'Organization', name: data.brand } : { '@type': 'Organization', name: 'Repro Disseny' }, // Usar brand si existe
           offers: {
               '@type': 'Offer',
               price: data.price || 0,
               priceCurrency: data.priceCurrency || 'EUR',
               availability: data.inStock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock' // Usar inStock para disponibilidad
           }
       };
       changed = true;
   } else {
       // Si el schema ya existe y es un objeto con @type 'Product', validar/corregir subcampos si es necesario
       // Esto puede volverse complejo. Una opción simple es solo asegurar los campos principales.
       const currentSchema = data.schema;
       let schemaChanged = false;

       if (currentSchema.name !== (data.title || fileName)) { currentSchema.name = (data.title || fileName); schemaChanged = true; }
       if (currentSchema.description !== (data.description || '')) { currentSchema.description = (data.description || ''); schemaChanged = true; }
       // Aquí podrías validar image, sku, brand, offers si son importantes

       if (schemaChanged) {
           console.log(`   🔧 Campos en Schema existente actualizados en ${filePath}`);
           changed = true; // Marca el frontmatter como cambiado si el schema interno cambió
       }
   }


  // --- Fin Validaciones ---


  return changed;
}


// --- Funciones de Recorrido y Ejecución (Sin cambios) ---

/**
 * Recorre recursivamente un directorio y encuentra todos los archivos .md EXCEPTO index.md.
 * @param {string} dir - Directorio a recorrer.
 * @returns {string[]} Array de rutas completas de archivos .md.
 */
function walk(dir) {
  let files = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = [...files, ...walk(fullPath)];
      } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md') {
        files.push(fullPath);
      }
    }
  } catch (error) {
      console.error(`❌ Error al leer directorio ${dir}:`, error);
  }
  return files;
}

/**
 * Procesa un archivo Markdown de producto: lee, valida, escribe si hay cambios.
 * @param {string} filePath - Ruta completa del archivo.
 */
function processFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const { content, data } = matter(raw);

    const changed = validateAndAutofillProduct(data, content, filePath);

    if (changed) {
        // Ordenar el frontmatter al escribir (opcional, pero limpia)
        const orderedData = Object.keys(data)
            .sort() // Orden alfabético
            .reduce((obj, key) => {
                obj[key] = data[key];
                return obj;
            }, {});
        const newRaw = matter.stringify(content, orderedData);
        fs.writeFileSync(filePath, newRaw, 'utf8');
        console.log(`✅ Corregido y Ordenado: ${filePath}`);
    } else {
        console.log(`✔️  OK: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error procesando archivo ${filePath}:`, error);
  }
}

/**
 * Función principal para ejecutar el script.
 */
function run() {
  console.log(`🔍 Buscando archivos de producto (*.md excluyendo index.md) en ${baseDir}...`);

  const productFiles = walk(baseDir);

  if (!productFiles.length) {
    console.log('⚠️ No se encontraron archivos de producto en content/categorias/ y subdirectorios.');
    return;
  }

  console.log(`✨ Encontrados ${productFiles.length} archivos de producto.`);
  console.log(`🛠️ Validando y corrigiendo frontmatter...`);

  productFiles.forEach(processFile);

  console.log('🏁 Validación y corrección completa.');
}

// Ejecutar el script
run();