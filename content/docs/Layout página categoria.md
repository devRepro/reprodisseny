# Formato de Página de Categoría

Este documento define la estructura y formato recomendado para las páginas de categoría en Repro Disseny.

## 1. Meta y SEO
- **Título de la página**: `<title>` dinámico con el nombre de la categoría.
- **Meta descripción**: `<meta name="description">` con resumen breve de la categoría.
- **Open Graph**: `og:title`, `og:description`, `og:image`.

## 2. Breadcrumbs
```vue
<Breadcrumbs>
  <BreadcrumbItem href="/">Inicio</BreadcrumbItem>
  <BreadcrumbItem href="/categorias">Categorías</BreadcrumbItem>
  <BreadcrumbItem active>{{ categoria.titulo }}</BreadcrumbItem>
</Breadcrumbs>
```

## 3. Hero
Sección destacada con:
- Imagen de fondo (lazy).
- Gradiente superpuesto.
- Título y descripción.

## 4. Filtros (solo en desktop)
- Grupo de checkboxes para marcas o atributos.
- Input de búsqueda.
- Rango de precio si aplica.

## 5. Navegación por pestañas (Tabs)
- Siempre usar `Tabs`, `TabsList`, `TabsTrigger` y `TabsContent`.
- Secciones: Top Ventas, Novedades, Populares.

## 6. Grid de productos
- Usar componente `<ProductGrid :products="..."/>`.

## 7. FAQ (Acordeón)
- Sección con `<Accordion>`, `<AccordionItem>`, `<AccordionTrigger>`, `<AccordionContent>`.

## 8. Llamada a la acción
- Botón destacado `Contáctanos para más información`.

## 9. Footer y accesibilidad
- Descripción en el layout, sin lógica en la plantilla.
- Estructura semántica con `<section>`, `<aside>`, `<main>`.

---

**Notas de implementación:**
- Delegar lógica en componentes y composables.
- Mantener el layout limpio y declarativo.
- Optimización para SEO y accesibilidad.
- Responsive: usar clases Tailwind con breakpoints.
