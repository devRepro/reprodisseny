# 📘 Tipos TypeScript usados en el proyecto ReproDisseny

Esta documentación cubre las interfaces definidas en `types/index.ts` y cómo deben usarse para asegurar una estructura clara, robusta y escalable en los contenidos de productos, categorías y subcategorías.

---

## 🧩 `FormField`
Campos dinámicos utilizados en los formularios de productos.

```ts
export interface FormField {
  label: string
  name: string
  type: 'text' | 'number' | 'select'
  required: boolean
  options?: string[]
}
```

---

## 📦 `Producto`
Representa un producto dentro de una categoría.

```ts
export interface Producto {
  title: string
  slug: string
  category: string
  description: string
  keywords?: string[]
  image: string
  alt?: string
  tags?: string[]
  navigation?: boolean
  metatitle?: string
  metadescription?: string
  type?: 'producto'
  sku?: string
  price?: number
  priceCurrency?: string
  inStock?: boolean
  brand?: string
  path: string
  formFields?: FormField[]
  schema?: SchemaOrg
}
```

---

## 📚 `Categoria`
Representa una categoría general que puede contener productos y/o subcategorías.

```ts
export interface Categoria {
  title: string
  navigation?: boolean
  nav?: string
  slug?: string
  description: string
  keywords?: string[]
  image?: string
  alt?: string
  type?: 'categoria'
  path: string
  formFields?: FormField[]
  children?: (Producto | Subcategoria)[]
}
```

---

## 🗂 `Subcategoria`
Elemento intermedio entre una categoría y sus productos. Utilizado cuando una categoría contiene divisiones internas.

```ts
export interface Subcategoria {
  title: string
  slug: string
  type: 'subcategoria'
  path: string
  children?: Producto[]
  [key: string]: any
}
```

---

## 📐 `SchemaOrg`
Objeto para la integración con [Schema.org](https://schema.org/Product) para datos estructurados SEO.

```ts
export interface SchemaOrg {
  '@type': 'Product'
  name: string
  description: string
  image: string
  sku: string
  brand: {
    '@type': 'Organization'
    name: string
  }
  offers: {
    '@type': 'Offer'
    price: number
    priceCurrency: string
    availability: string
  }
}
```

---

## ✅ Buenas prácticas

- Todos los productos deben tener `schema` generado automáticamente por el script de validación.
- Los campos `keywords`, `searchTerms`, `metaTitle`, `metaDescription`, y `alt` deben cuidarse especialmente por su valor en SEO.
- El campo `formFields` permite añadir inputs personalizados en los formularios de producto.

---

> Última actualización: abril 2025

