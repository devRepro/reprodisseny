# Instrucciones completas para Categorías y Productos en Nuxt 3

Estas plantillas garantizan máxima calidad SEO, usabilidad, accesibilidad, experiencia de usuario, rendimiento y futura compatibilidad e-commerce con Schema.org.

## 📂 Estructura estándar recomendada

```txt
content/
├── categorias/
│   ├── [nombre-categoria]/
│   │   ├── categoria/
│   │   │   └── index.md
│   │   └── [producto].md
```

---

## ✅ Plantilla optimizada Categoría

Campos recomendados:

- `title`: Título visible principal.
- `metaTitle`: Título SEO específico (etiqueta `<title>`).
- `description`: Breve descripción visible optimizada.
- `metaDescription`: Descripción SEO específica.
- `keywords`: Palabras clave para SEO (array).
- `searchTerms`: Palabras para buscador interno (array).
- `image`: Imagen principal (usar `/img/category/mockupweb.webp` si no hay).
- `galleryImages`: Imágenes secundarias para banners o carruseles (array opcional).
- `alt`: Texto alternativo imagen (accesibilidad).
- `slug`: URL amigable.
- `schemaType`: Por defecto `CollectionPage` (Schema.org).
- `featured`: Destacar categoría en homepage o menú (opcional).
- `order`: Orden visual en listados (opcional).
- `type`: Siempre `categoria`.

---

## ✅ Plantilla optimizada Producto

Campos recomendados:

- `title`: Título principal del producto.
- `metaTitle`: Título SEO específico.
- `description`: Breve descripción optimizada visible.
- `metaDescription`: Descripción SEO específica.
- `keywords`: Palabras clave para SEO (array).
- `searchTerms`: Términos específicos para buscador interno (array).
- `image`: Imagen principal del producto (usar `/img/product/mockupProduct.webp` si no hay).
- `galleryImages`: Imágenes adicionales para galería o carrusel (array opcional).
- `alt`: Texto alternativo imagen (accesibilidad).
- `slug`: URL amigable del producto.
- `category`: Categoría a la que pertenece.
- `sku`: Código único o referencia.
- `price`: Precio de venta.
- `priceCurrency`: Moneda (ej: EUR).
- `brand`: Marca del producto.
- `inStock`: Disponibilidad (`true`/`false`).
- `formFields`: Campos dinámicos formulario de producto (array).
- `ratingValue`: Valoración promedio (Schema.org, opcional).
- `reviewCount`: Número de valoraciones (Schema.org, opcional).
- `type`: Siempre `producto`.
- `schema`: Bloque completo `@type: Product` según Schema.org, generado automáticamente.

---

## 🌟 Beneficios directos de usar estas plantillas

- **SEO competitivo**: Mejor posicionamiento orgánico y mayor visibilidad.
- **Usabilidad y UX**: Estructura clara, navegación optimizada.
- **Accesibilidad**: Cumple estándares básicos WCAG (textos alternativos).
- **Performance**: Imágenes claras, ligeras, formato estándar.
- **Escalabilidad E-commerce**: Preparado desde el inicio para integrar con plataformas comerciales.

Estas plantillas deben usarse siempre como base para cualquier contenido nuevo o actualización en el proyecto.

