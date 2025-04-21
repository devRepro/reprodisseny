# Formato de Página de Categoría

Este documento define la estructura y formato recomendado para las páginas de categoría en Repro Disseny.

## 1. Meta y SEO
- **Título de la página**: `<title>` dinámico con el nombre de la categoría.
- **Meta descripción**: `<meta name="description">` con resumen breve de la categoría.
- **Open Graph**: `og:title`, `og:description`, `og:image`.
- **Canonical y Hreflang**: `<link rel="canonical">`, `<link rel="alternate" hreflang="…"/>` si aplica.
- **JSON-LD**: `BreadcrumbList`, `Product`, `Offer` y `AggregateRating` (si hay reviews de Google MyBusiness).

## 2. Barra de confianza y Social Proof
- Banner superior opcional con promociones (`Envío 24h`, `–10% primer pedido`).
- Widget de Google MyBusiness: mostrar 3 últimas reseñas con rating y enlace a MyBusiness.
- Logos de métodos de pago y certificaciones.  
  *(Utilizar componente `<TrustBar />` que reciba props: `reviews`, `icons`.)*

## 3. Breadcrumbs
```vue
<Breadcrumbs>
  <BreadcrumbItem href="/">Inicio</BreadcrumbItem>
  <BreadcrumbItem href="/categorias">Categorías</BreadcrumbItem>
  <BreadcrumbItem active>{{ categoria.titulo }}</BreadcrumbItem>
</Breadcrumbs>
```

## 4. Hero y Subcategorías
- Sección hero con imagen de fondo lazy, gradiente y texto (título, descripción, CTA “Ver productos”).
- Debajo, grid de subcategorías (imagen + título + botón “Ver más”). En mobile, carrusel embla-carousel.

## 5. Sidebar de filtros avanzados
- Desktop: sidebar sticky con filtros anidados (marca, atributos, precio, buscador interno).  
- Mobile: modal deslizante desde el lateral con botón “Filtros”.  
- Componente `<FiltersSidebar filters="…"/>`.

## 6. Control de ordenación y vista
- Dropdown `Ordenar por`: Relevancia, Precio asc/desc, Novedad.
- Toggle Grid/List view: dos íconos para cambiar layout.
- Mostrar contador de resultados `Mostrando 1–20 de 150`.

## 7. Grid de productos enriquecido
- `<ProductCard />` con hover-zoom, botón “Vista rápida” (abrir modal con detalle breve).
- Mostrar badge “Nuevo” o “Más vendido” si corresponde.
- Mostrar precio y CTA “Consultar precio”.

## 8. Formulario de consulta de precios
- En cada tarjeta y al final de la sección, CTA a componente `<PriceInquiryForm />`.
- Formulario ligero: nombre, email, teléfono, mensaje.  
  Acción `onSubmit` envía con SendGrid o Netlify Functions.

## 9. Contenido SEO‑rich
- Descripción larga de la categoría al final del grid, con teaser y “Leer más” desplegable.
- Subtítulos `<h2>` con palabras clave.

## 10. FAQs en acordeón
- `<Accordion>` con preguntas frecuentes.
- Enlace directo con ancla `#faq-3` para enlazar.

## 11. Cross‑selling y productos relacionados
- Sección “También te puede interesar” con `<ProductGrid :products="related"/>`.

## 12. Newsletter y llamada final
- Sección con `<NewsletterSignup/>`: incentivo “–10% en tu siguiente consulta”.
- Footer con logos de pago, certificaciones y Trustpilot.

## 13. Accesibilidad
- `aria-label`, `role`, contraste y foco visible.
- Semántica: `<main>`, `<section>`, `<aside>`, `<nav>`.

## 14. Scripts de validación
- Asegurar integración con `validate-md`, `validate-md-seo`, `validate:categorias`.

---

> **Ejemplo de JSON-LD**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [ /* ... */ ]
}
```

> **Nota**: Adaptar cada componente a tu sistema de clases Tailwind y al paquete `@shadcn/ui`.
