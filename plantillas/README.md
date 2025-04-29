
# Instrucciones completas para Categorías y Productos en Nuxt 3

Estas plantillas garantizan máxima calidad SEO, usabilidad, accesibilidad, experiencia de usuario, rendimiento y futura compatibilidad e-commerce con Schema.org.

## 📂 Estructura estándar recomendada

```
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
- `keywords`: Palabras clave para SEO.
- `searchTerms`: Palabras para buscador interno.
- `image`: Imagen principal (usar `/img/category/mockuopweb.webp` si no hay).
- `galleryImages`: Imágenes secundarias para banners o carruseles (opcional).
- `alt`: Texto alternativo imagen (accesibilidad).
- `slug`: URL amigable.
- `schemaType`: Por defecto `CollectionPage` (Schema.org).
- `featured`: Destacar categoría en homepage o menú (opcional).
- `order`: Orden visual en listados (opcional).

---

## ✅ Plantilla optimizada Producto

Campos recomendados:

- `title`: Título principal del producto.
- `metaTitle`: Título SEO específico.
- `description`: Breve descripción optimizada visible.
- `metaDescription`: Descripción SEO específica.
- `keywords`: Palabras clave para SEO.
- `searchTerms`: Términos específicos para buscador interno.
- `image`: Imagen principal del producto (usar `/img/product/mockupProduct.webp` si no hay).
- `galleryImages`: Imágenes adicionales para galería o carrusel (opcional).
- `alt`: Texto alternativo imagen (accesibilidad).
- `slug`: URL amigable del producto.
- `category`: Categoría a la que pertenece.
- `sku`: Código único o referencia.
- `price`: Precio de venta.
- `brand`: Marca del producto.
- `inStock`: Disponibilidad (true/false).
- `formFields`: Campos dinámicos formulario de producto.
- `ratingValue`: Valoración promedio (Schema.org, opcional).
- `reviewCount`: Número de valoraciones (Schema.org, opcional).
- `schemaType`: Por defecto `Product`.

---

## 🎯 Beneficios directos de usar estas plantillas

- **SEO competitivo**: Mejor posicionamiento orgánico y mayor visibilidad.
- **Usabilidad y UX**: Estructura clara, navegación optimizada.
- **Accesibilidad**: Cumple estándares básicos WCAG (textos alternativos).
- **Performance**: Imágenes claras, ligeras, formato estándar.
- **Escalabilidad E-commerce**: Preparado desde el inicio para integrar con plataformas comerciales.

Estas plantillas deben usarse siempre como base para cualquier contenido nuevo o actualización en el proyecto.
