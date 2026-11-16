# REF-PUBLICACIONES-SEO-01 — Entrega para revisión

Implementación local en `feat/publicaciones-editorial-seo`, sobre `b4f0686`. No se ha desplegado, fusionado ni enviado código a un remoto. La auditoría previa está en [audits/REF-PUBLICACIONES-SEO-01.md](audits/REF-PUBLICACIONES-SEO-01.md).

## Resultado comercial

Publicaciones mantiene su URL y pasa a organizar la oferta por intención: catálogos, revistas, libros y manuales/dossiers. Los dos primeros grupos enlazan a sus landings comerciales y después aparecen proyecto editorial, cinco perfiles profesionales y el catálogo dinámico completo. Se conservan todos los detalles, tipos, formatos, papeles, cubiertas, acabados, proceso y FAQs originales.

La landing de catálogos desarrolla presentación de producto, colecciones, tarifas, formato, materiales, cubiertas y distribución comercial. La de revistas desarrolla comunicación editorial/corporativa, periodicidad, paginación, preparación del lomo, grapado/fresado y continuidad entre ediciones. Comparten presentación y componentes, con contenido específico.

Los presupuestos usan `quote/FormSection.vue`, el endpoint y los eventos existentes. En las landings el formulario recibe el contexto de la publicación. Los enlaces de la categoría utilizan `/pedir-presupuesto?publicacion=editorial`; la página de presupuesto admite también los valores cerrados `catalogos` y `revistas`. Los valores desconocidos mantienen el presupuesto genérico. No se añaden campos obligatorios ni eventos de conversión.

## Reutilización

- De Eventos: `CategoryHero` en variante comercial, `CommercialSolutions` (confianza, agrupaciones, proyecto y casos de uso), `CategoryProductsGrid`, `ContentSectionShell`, `ContentSectionIntro`, `ContentSectionsRenderer`/pestañas, `ContentProcessSteps`, `FaqAccordion`, `SiteBreadcrumbs` y `AppButton`.
- Estilos: `assets/styles/main.scss` sin modificar. Misma Figtree, tokens, contenedores, grids, proporciones, botones y breakpoints.
- Componente nuevo: `components/marketing/landing/EditorialLanding.vue`, que compone los anteriores y el formulario existente. Las dos rutas estáticas son envoltorios de este componente.
- Extensión mínima de `CommercialJson`: aplicaciones y CTA opcionales por grupo, texto del catálogo y CTA opcional del bloque de proyecto. Eventos conserva sus valores y su marcado resultante.
- Contenido comercial de landings: `shared/data/editorialLandings.ts`; rutas, SEO y contextos de presupuesto: `shared/seo/editorialRoutes.ts`. La selección de imágenes está separada en `shared/data/editorialMedia.ts` y se resuelve desde el catálogo y la galería actual. Catálogos usa un detalle neutro de cubierta; revistas, la imagen existente de grapado.

## Rutas y metadatos

| Página | Ruta conservada o nueva | Title | H1 |
| --- | --- | --- | --- |
| Publicaciones | `/categorias/libros-revistas-catalogos` (conservada) | Catálogos, revistas y libros en Barcelona \| Repro Disseny | Impresión de catálogos, revistas y libros en Barcelona |
| Catálogos | `/productos/impresion-catalogos-barcelona` (nueva) | Impresión de catálogos en Barcelona \| Repro Disseny | Imprimir catálogos profesionales en Barcelona |
| Revistas | `/productos/impresion-revistas-barcelona` (nueva) | Imprimir revistas en Barcelona \| Repro Disseny | Impresión de revistas personalizadas en Barcelona |

| Página | Meta description | Canonical |
| --- | --- | --- |
| Publicaciones | Impresión editorial y corporativa en Barcelona: catálogos, revistas, libros y manuales. Te asesoramos en papel, encuadernación y acabados. Pide presupuesto. | `https://reprodisseny.com/categorias/libros-revistas-catalogos` |
| Catálogos | Imprimimos catálogos comerciales y de producto en Barcelona. Diferentes formatos, papeles, encuadernaciones y acabados personalizados. Solicita presupuesto. | `https://reprodisseny.com/productos/impresion-catalogos-barcelona` |
| Revistas | Imprimimos revistas corporativas, editoriales y publicaciones periódicas en Barcelona. Diferentes formatos, papeles y encuadernaciones. Solicita presupuesto. | `https://reprodisseny.com/productos/impresion-revistas-barcelona` |

Las landings usan `WebPage`, `Service`, `BreadcrumbList` y `FAQPage` coincidentes con el contenido visible, sin precios, disponibilidad, valoraciones ni reseñas. La categoría conserva la generación de `CollectionPage`, `ItemList` y breadcrumbs. Sitemap: se amplía el registro estático de `/api/__sitemap__/urls`, sin añadir productos ficticios a los JSON generados del CMS. Los textos de las pestañas permanecen en el HTML inicial.

Siete URLs de producto conservadas íntegramente:

- `/productos/encuadernacion-wire-o-oculto`
- `/productos/cosida-tapa-blanda`
- `/productos/encuadernacion-cosida-tapa-dura`
- `/productos/encuadernacion-encolada-tapa-blanda`
- `/productos/encuadernacion-wire-o`
- `/productos/encuadernado-con-grapas`
- `/productos/hojas-sueltas-archivadores`

Redirecciones: `/product/imprimir-revista-presupuesto` pasa de la categoría general a `/productos/impresion-revistas-barcelona` con 301 directo. Se añade el mismo destino para su variante `/printestimate`. No se cambia ninguna otra familia de redirecciones.

Homepage: se conserva el enlace a Publicaciones y se añaden enlaces HTML a ambas landings en el bloque de soluciones destacadas.

Blog externo: [la URL indicada](https://blog.reprodisseny.com/como-imprimir-una-revista/) no respondió en la consulta (502). El código actual clasifica ese host como retirado. No se modifica ese sistema. Si el artículo se mantiene o recupera en otro CMS, añadir en su contenido un enlace HTML con texto contextual «impresión de revistas en Barcelona» hacia la nueva landing; confirmar antes quién gestiona ese host. No se ha recuperado contenido histórico íntegro de la antigua ficha; el contenido técnico reutilizado procede del catálogo actual.

## Multimedia y fotografías pendientes

Se han verificado por descarga las dimensiones de seis archivos del CDN: hero 2400×2400; tres detalles y las imágenes de fresado/grapado 1200×1200. Se corrigen únicamente las dimensiones declaradas del hero de la categoría (antes 350×321). Las otras fichas e imágenes se mantienen.

Las imágenes del catálogo son recursos ilustrativos ya publicados. No se acredita que correspondan a encargos reales ni se presentan como trabajos de clientes. No se han generado imágenes ni incorporado bancos externos. Las descargas de auditoría están en `reports/publicaciones-seo/` y no se sirven como nuevos recursos de producción.

| Ubicación pendiente | Ratio / tamaño recomendado | Contenido de una futura fotografía real | Nombre propuesto en la estructura multimedia actual |
| --- | --- | --- | --- |
| Hero Publicaciones | Composición para recorte 8:5, maestro 2400×1500 o superior | Catálogos y revistas abiertos/cerrados sobre fondo neutro, con encuadernación visible | `category/publicaciones imatges/publicaciones-editoriales-hero.webp` |
| Hero Catálogos | 8:5, 2400×1500 | Catálogo comercial real fresado, abierto y cerrado, colección de producto | `category/publicaciones imatges/catalogos-comerciales-hero.webp` |
| Hero Revistas | 8:5, 2400×1500 | Revista real grapada y detalle de apertura, sin datos personales | `category/publicaciones imatges/revistas-grapadas-hero.webp` |
| Ejemplos de soluciones | 1:1, 1200×1200 | Encuadernación, canto y papel de ejemplares reales de fresado/grapado | `category/publicaciones imatges/catalogo-revista-detalle.webp` |
| Acabados | 4:3, 1600×1200 | Laminados y detalle de barniz/stamping/gofrado en una cubierta real | `category/publicaciones imatges/acabados-editoriales-detalle.webp` |

Antes de sustituir archivos: verificar derechos y autorización de reproducción del proyecto; subir por el sistema multimedia actual y actualizar la selección de imagen y sus dimensiones. Los nombres propuestos son inventario, no referencias a archivos existentes.

## Validaciones y evidencias

Resultados finales y capturas se completan al terminar la revisión local. Logs y artefactos: `reports/publicaciones-seo/` (directorio ignorado por Git). No se escriben solicitudes en SharePoint ni se envían correos: las pruebas de navegador interceptan las escrituras antes de que alcancen el backend.

Comprobación de integridad contra `b4f0686`: los 118 registros de productos y las otras 11 categorías son idénticos. En Publicaciones son idénticos ID, path, secciones técnicas, proceso, FAQs, relaciones y breadcrumbs. CSS global y `CategoryHero` también son idénticos. Evidencia: `integrity.json`.

No existe script de lint en `package.json`; no se instala un linter. El build informa advertencias existentes de paquetes (`exports`, anotaciones PURE, robots sobre API y tamaño de chunks); no se amplía el alcance para corregir dependencias.

## Archivos

- `cms/catalog.json`, `cms/search-index.json`
- `components/marketing/category/CommercialSolutions.vue`
- `components/marketing/content/ContentSectionsRenderer.vue` (encabezados accesibles opcionales solo en Publicaciones)
- `components/marketing/landing/EditorialLanding.vue` (nuevo)
- `components/marketing/HomeBusinessIntro.vue`
- `pages/categorias/[...slug].vue`, `pages/pedir-presupuesto.vue`
- `pages/productos/impresion-catalogos-barcelona.vue` (nuevo)
- `pages/productos/impresion-revistas-barcelona.vue` (nuevo)
- `server/services/cms/catalog.service.ts`, `server/api/__sitemap__/urls.ts`
- `shared/data/editorialLandings.ts`, `shared/data/editorialMedia.ts`, `shared/seo/editorialRoutes.ts` (nuevos)
- `redirect-rules.generated.ts`, `scripts/validate-seo-redirects.ts`
- `scripts/verify-publicaciones-http.mjs`, `scripts/verify-publicaciones-responsive.mjs` (nuevos)
- `scripts/preview-publicaciones-local.mjs` (arranque local del mismo output de Nitro)
- `tests/publicaciones-editorial.test.ts` (nuevo)
- `tests/category-tabs-interaction.test.ts` (permite reutilizar un preview local con `CATEGORY_TABS_BASE_URL`, conservando el arranque dev por defecto)
- Este informe y `docs/audits/REF-PUBLICACIONES-SEO-01.md`

## Previsualización local

Después del build, ejecutar `node scripts/preview-publicaciones-local.mjs` y abrir:

- `http://127.0.0.1:3100/categorias/libros-revistas-catalogos`
- `http://127.0.0.1:3100/productos/impresion-catalogos-barcelona`
- `http://127.0.0.1:3100/productos/impresion-revistas-barcelona`
- `http://127.0.0.1:3100/categorias/eventos`

Es el output de producción de Nuxt enlazado exclusivamente a loopback. El helper resuelve únicamente en Windows el fallback POSIX de `import.meta` emitido por Nitro; no cambia el bundle ni se usa en despliegues. Las capturas se generan con `node scripts/verify-publicaciones-responsive.mjs`; la comprobación HTTP con `node scripts/verify-publicaciones-http.mjs`. No mantener un dev y un build escribiendo simultáneamente en `.nuxt`.

## Publicación y rollback

1. Revisar gráfica, contenidos y fotografías en la rama local. No hay PR ni rama remota publicada por esta tarea.
2. El snapshot `cms/catalog.json` es el mismo sistema de datos existente. Antes del siguiente `sync:cms:write`, trasladar al registro de Publicaciones del CMS los valores revisados de título, descripción, SEO, dimensiones y `CommercialJson` de este snapshot; una sincronización que use el contenido anterior los sobrescribiría. No ejecutar `generate` como sustituto del build sin atender este paso: su script inicia la sincronización. Se evita introducir un sistema de overrides o un segundo CMS. Las landings siguen el patrón estático ya existente.
3. Tras la aprobación, integrar mediante revisión en el flujo de publicación del repositorio. Confirmar el alojamiento/pipeline real: el README solo documenta el build y preview genéricos de Nuxt, no se inventa un procedimiento de proveedor.
4. Construir con el origen público de producción configurado: `NUXT_SITE_ENV=production`, `NUXT_SITE_URL=https://reprodisseny.com`, `NUXT_PUBLIC_SITE_URL=https://reprodisseny.com`. En previsualizaciones compartidas conservar las protecciones de noindex del entorno.
5. Ejecutar tests, typecheck, validadores SEO y build. Sobre un preview aislado comprobar las tres páginas, siete fichas, sitemap, canonical, 301 y formulario con transporte simulado. El directorio `reports` y el bootstrap de Windows son solo herramientas locales.
6. Publicar únicamente con aprobación expresa. Comprobar en producción respuestas 200/301, sitemap y canonical, y una conversión controlada con consentimiento y herramientas de diagnóstico del sistema actual. No se duplica instrumentación.
7. Rollback: restaurar el artefacto anterior mediante el mecanismo real del hosting. Alternativamente revertir los seis commits de la rama en orden inverso y reconstruir. Si se actualizaron los campos fuente del CMS, restaurar también sus valores anteriores para mantener coherencia con el snapshot. No eliminar las nuevas URLs de una publicación ya indexada sin decidir su destino SEO.

## Seguimiento SEO

Datos de partida: los facilitados en el encargo, analizados el 16/11/2026. No se interpretan como prueba de canibalización ni como garantía de crecimiento.

| Plazo desde el despliegue | Comprobaciones y decisiones |
| --- | --- |
| 30 días | Inspeccionar las tres URLs en Search Console: descubrimiento, indexabilidad, canonical elegido, sitemap y estado del 301. Comparar impresiones/clics/CTR/posición por página y por consultas de catálogos y revistas. Confirmar que los presupuestos conservan la publicación y que no se duplican conversiones. |
| 60 días | Comparar ventanas equivalentes y segmentar consultas, dispositivo y página. Revisar qué página responde a cada intención, sin asumir canibalización por coexistencia de impresiones. Si hay impresiones relevantes con CTR bajo, revisar snippet y propuesta comercial; incorporar fotos reales disponibles. |
| 90 días | Evaluar tendencia y solicitudes comerciales atribuidas por publicación. Revisar enlaces internos y calidad de visitas/presupuestos con el equipo comercial. Ajustar contenido con evidencia; mantener las URLs y priorizar las consultas con oportunidad constatada. |

La indexación efectiva, las métricas de campo y los resultados comerciales se verificarán después de desplegar; un build local no los demuestra.
