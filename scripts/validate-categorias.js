import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Directorio base de las categorías
const categoriasDir = path.resolve('content/categorias');
const today = new Date().toISOString().slice(0, 10); // No usado en la lógica actual, pero presente en el original

// --- Funciones de Ayuda (Adaptadas/Revisadas) ---

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
 * Intenta extraer la primera línea de párrafo significativa del contenido Markdown después del H1.
 * @param {string} content - Contenido Markdown.
 * @returns {string} Descripción extraída o cadena vacía.
 */
function extractDescriptionFromContent(content) {
  const lines = content.split('\n');
  let inCodeBlock = false;
  let inFrontmatter = true;

  for (const line of lines) {
    if (line.trim() === '---') {
        inFrontmatter = !inFrontmatter;
        continue;
    }
    if (inFrontmatter) continue;

    // Manejar bloques de código para saltarlos
    if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
    }
    if (inCodeBlock) continue;

    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#') && !trimmedLine.startsWith('>') && !trimmedLine.startsWith('-') && !trimmedLine.startsWith('*') && !trimmedLine.startsWith('`') && !trimmedLine.startsWith('[') && !trimmedLine.startsWith('!') && !trimmedLine.startsWith('<')) {
       // Heurística simple: buscar la primera línea de texto que no parezca un elemento de bloque Markdown
       return trimmedLine;
    }
  }
  return '';
}


// --- Lógica de Validación y Autofill ---

/**
 * Valida y corrige el frontmatter de un archivo index.md.
 * @param {object} data - Objeto del frontmatter (por referencia, se modifica).
 * @param {string} content - Contenido Markdown del archivo.
 * @param {string} filePath - Ruta completa del archivo.
 * @returns {boolean} True si se realizaron cambios, False en caso contrario.
 */
function validateAndAutofillIndexMd(data, content, filePath) {
  let changed = false;
  const relativePath = path.relative(categoriasDir, filePath); // ej: 'adhesivos/index.md' o 'adhesivos/etiquetas/index.md'

  // Ignorar el index.md en la raíz de content/ (si existe y no es el que queremos)
  // Asumimos que content/categorias/index.md NO es una página de categoría aquí
  // Si SÍ quieres procesar content/categorias/index.md, ajusta esta lógica
  if (relativePath === 'index.md') {
      console.log(`⏭️ Saltando: ${filePath} (index.md en la raíz de categorias)`);
      return false; // No procesar este archivo con esta lógica
  }

  // Separar la ruta relativa en segmentos de directorio
  const segments = relativePath.split(path.sep).filter(Boolean); // ej: ['adhesivos', 'index.md'] o ['adhesivos', 'etiquetas', 'index.md']

  // El último segmento es 'index.md', el penúltimo es el slug de la categoría/subcategoría
  if (segments.length < 2 || segments[segments.length - 1] !== 'index.md') {
      console.warn(`⚠️ Ruta inesperada para index.md: ${filePath}. Saltando.`);
      return false;
  }

  const fileSlug = segments[segments.length - 2]; // ej: 'adhesivos' o 'etiquetas'
  const parentSlug = segments.length > 2 ? segments[segments.length - 3] : null; // ej: null o 'adhesivos'

  // Determinar el tipo basado en la profundidad
  const determinedType = segments.length === 2 ? 'categoria' : 'subcategoria';
  const expectedPathSegments = segments.slice(0, -1); // ej: ['adhesivos'] o ['adhesivos', 'etiquetas']
  const expectedPath = '/categorias/' + expectedPathSegments.join('/'); // ej: '/categorias/adhesivos' o '/categorias/adhesivos/etiquetas'


  // --- Validación y Autofill de Campos ---

  // slug (Debe coincidir con el nombre de la carpeta)
  if (data.slug !== fileSlug) {
    console.log(`   🔧 Slug incorrecto: '${data.slug}' -> '${fileSlug}' en ${filePath}`);
    data.slug = fileSlug;
    changed = true;
  }
  // path (Debe coincidir con /categorias/ + ruta relativa)
  if (data.path !== expectedPath) {
      console.log(`   🔧 Path incorrecto: '${data.path}' -> '${expectedPath}' en ${filePath}`);
      data.path = expectedPath;
      changed = true;
  }

  // type (Debe coincidir con el tipo determinado por la profundidad)
  if (data.type !== determinedType) {
    console.log(`   🔧 Tipo incorrecto: '${data.type}' -> '${determinedType}' en ${filePath}`);
    data.type = determinedType;
    changed = true;
  }

  // category (Solo para subcategorías, debe ser el slug del padre)
  if (determinedType === 'subcategoria') {
      if (data.category !== parentSlug) {
          console.log(`   🔧 Categoría padre incorrecta: '${data.category}' -> '${parentSlug}' en ${filePath}`);
          data.category = parentSlug;
          changed = true;
      }
  } else { // Es 'categoria' (raíz)
      // La categoría raíz no debería tener un padre 'category' definido o debe ser null/''
      if (data.category && data.category !== '') {
          console.log(`   🔧 Categoría padre incorrecta para categoría raíz: '${data.category}' -> '' en ${filePath}`);
          data.category = '';
          changed = true;
      }
  }

  // title (Obligatorio, autofill desde H1 si falta)
  if (!data.title) {
    const titleFromContent = extractTitleFromContent(content);
    if (titleFromContent) {
        console.log(`   🔧 Título faltante: Autofill desde contenido -> '${titleFromContent}' en ${filePath}`);
        data.title = titleFromContent;
        changed = true;
    } else {
        // Autofill desde slug como fallback si no hay H1
         const titleFromSlug = toTitleCase(fileSlug);
         console.log(`   🔧 Título faltante y sin H1: Autofill desde slug -> '${titleFromSlug}' en ${filePath}`);
         data.title = titleFromSlug;
         changed = true;
    }
  }

  // description (Obligatorio, autofill desde primera línea de párrafo si falta)
   if (!data.description) {
       const descFromContent = extractDescriptionFromContent(content);
       if (descFromContent) {
           console.log(`   🔧 Descripción faltante: Autofill desde contenido -> '${descFromContent.substring(0, 50)}...' en ${filePath}`);
           data.description = descFromContent;
           changed = true;
       } else {
           console.warn(`   ⚠️ Descripción faltante y sin párrafo en contenido en ${filePath}`);
           // No se autofilla automáticamente si no hay fuente clara en el contenido
       }
   }


  // nav (Obligatorio para Categoria en types, pero opcional en subcategoria. Autofill desde title)
  // Basado en tu type Categoria: nav: string; Subcategoria: no tiene nav.
  // Adapto la lógica para autofill si falta en ambos tipos, pero no lo hago obligatorio para subcategoria si el type no lo exige.
   if (!data.nav) {
       if (data.title) {
           const navFromTitle = data.title.split('|')[0].trim();
            console.log(`   🔧 Nav faltante: Autofill desde título -> '${navFromTitle}' en ${filePath}`);
            data.nav = navFromTitle;
            changed = true;
       } else {
           console.warn(`   ⚠️ Nav faltante y sin título para autofill en ${filePath}`);
       }
   }


  // schemaType (Solo para Categoria, debe ser CollectionPage)
  if (determinedType === 'categoria') {
    if (data.schemaType !== 'CollectionPage') {
      console.log(`   🔧 schemaType incorrecto: '${data.schemaType}' -> 'CollectionPage' en ${filePath}`);
      data.schemaType = 'CollectionPage';
      changed = true;
    }
  } else { // Es 'subcategoria'
      // Las subcategorías no deberían tener schemaType CollectionPage o similar
      if (data.schemaType && data.schemaType === 'CollectionPage') {
           console.log(`   🔧 schemaType innecesario para subcategoría: '${data.schemaType}' -> null en ${filePath}`);
           data.schemaType = null; // O undefined
           changed = true;
      }
  }

   // faqs (Array opcional. Validar si es un array si existe)
   if (data.faqs && !Array.isArray(data.faqs)) {
       console.warn(`   ⚠️ FAQs no es un array en ${filePath}. Intentando convertir/limpiar.`);
       data.faqs = []; // Limpiar datos corruptos
       changed = true;
   } else if (data.faqs && data.faqs.some(faq => !faq || typeof faq.question !== 'string' || typeof faq.answer !== 'string')) {
       console.warn(`   ⚠️ FAQs contiene elementos con formato incorrecto en ${filePath}.`);
       // Podrías intentar filtrar o reportar cuáles son incorrectos
   }


  // schema (Objeto opcional. Validar si es un objeto si existe)
  if (data.schema && (typeof data.schema !== 'object' || data.schema === null || Array.isArray(data.schema))) {
      console.warn(`   ⚠️ Schema no es un objeto en ${filePath}. Limpiando.`);
      data.schema = null; // O undefined
      changed = true;
  } else if (data.schema && !data.schema['@type']) {
       console.warn(`   ⚠️ Schema falta '@type' en ${filePath}.`);
       // Podrías intentar inferir o reportar
  }

  // Otros campos opcionales que podrían tener valores por defecto si faltan
   if (typeof data.featured === 'undefined') { data.featured = false; changed = true; }
   if (typeof data.order === 'undefined') { data.order = 0; changed = true; }
   // Puedes añadir más para otros campos boolean, number, array, etc.

  // Notas:
  // - No validamos metatitle/metadescription/keywords/image/alt/galleryImages/searchTerms/formFields/ratingValue/reviewCount/brand/inStock/sku/price/priceCurrency aquí
  //   porque están presentes tanto en Categoria como Producto (en tus ejemplos), y este script SOLO procesa index.md
  //   que representan Categoria/Subcategoria, donde muchos de estos campos pueden estar vacíos o ausentes.
  //   La validación de estos campos para PRODUCTOS debería estar en un script separado que procese los archivos .md de productos.
  // - La lógica de category (padre) asume solo 2 niveles (cat/sub). Si hay más niveles (cat/sub/subsub),
  //   la detección de 'subcategoria' y el cálculo del 'parentSlug' necesitarían ajustarse.
  //   (ej: si segments.length > 2, siempre es 'subcategoria', y parentSlug sería segments[segments.length - 3]).

  return changed;
}


// --- Funciones de Recorrido y Ejecución ---

/**
 * Recorre recursivamente un directorio y encuentra todos los archivos .md.
 * (Esta función no cambia, la usamos para obtener todos los MD y luego filtramos)
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
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
      console.error(`❌ Error al leer directorio ${dir}:`, error);
  }
  return files;
}

/**
 * Procesa un archivo Markdown: lee, valida, escribe si hay cambios.
 * @param {string} filePath - Ruta completa del archivo.
 */
function processFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const { content, data } = matter(raw);

    // Solo ejecutar la lógica de validación si es un archivo index.md
    if (path.basename(filePath) === 'index.md') {
        const changed = validateAndAutofillIndexMd(data, content, filePath);

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
    } else {
        // Si walk encontró otros archivos .md (ej: productos), simplemente los saltamos aquí
        console.log(`⏭️ Saltando (no es index.md): ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error procesando archivo ${filePath}:`, error);
  }
}

/**
 * Función principal para ejecutar el script.
 */
function run() {
  console.log(`🔍 Buscando archivos index.md en ${categoriasDir}...`);

  // Obtener todos los archivos .md y luego filtrar solo los index.md
  const allMdFiles = walk(categoriasDir);
  const indexMdFiles = allMdFiles.filter(f => path.basename(f) === 'index.md');

  // Opcional: Excluir el index.md directamente en content/categorias/ si no lo necesitas
  // const indexMdFilesToProcess = indexMdFiles.filter(f => path.relative(categoriasDir, f) !== 'index.md');
  // console.log(`✨ Se excluirá content/categorias/index.md si existe.`); // Mensaje si decides excluirlo

  if (!indexMdFiles.length) {
    console.log('⚠️ No se encontraron archivos index.md en content/categorias/ y subdirectorios.');
    return;
  }

  console.log(`✨ Encontrados ${indexMdFiles.length} archivos index.md.`);
  console.log(`🛠️ Validando y corrigiendo frontmatter...`);

  indexMdFiles.forEach(processFile);

  console.log('🏁 Validación y corrección completa.');
}

// Ejecutar el script
run();