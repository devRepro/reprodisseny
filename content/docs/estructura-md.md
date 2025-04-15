# Estructura recomendada de Categorías y Productos

Estas plantillas garantizan máxima calidad SEO, usabilidad, accesibilidad, experiencia de usuario, rendimiento y futura compatibilidad e-commerce con Schema.org.

## 📂 Estructura de carpetas

```
content/
├── categorias/
│   ├── [nombre-categoria]/
│   │   ├── index.md               ← Detalles de la categoría
│   │   └── [producto].md          ← Productos individuales
```

---

## 🧩 Plantilla de Categoría

- `title`
- `metaTitle`
- `description`
- `metaDescription`
- `keywords`
- `searchTerms`
- `image`
- `galleryImages`
- `alt`
- `slug`
- `schemaType`: `"CollectionPage"`
- `featured`: `false`
- `order`: `0`
- `type`: `"categoria"`

---

## 🧩 Plantilla de Producto

- `title`
- `metaTitle`
- `description`
- `metaDescription`
- `keywords`
- `searchTerms`
- `image`
- `galleryImages`
- `alt`
- `slug`
- `category`
- `sku`
- `price`
- `brand`
- `inStock`
- `formFields`
- `ratingValue`
- `reviewCount`
- `schemaType`: `"Product"`
- `type`: `"producto"`