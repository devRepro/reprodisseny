# REF-PUBLICACIONES-SEO-01 — Entrega técnica y dirección de arte

Implementación en `feat/publicaciones-editorial-seo`, sobre `b4f0686`, con dirección de arte aprobada. No se ha desplegado ni fusionado. El estado de preparación, las operaciones pendientes en CMS y las instrucciones de publicación y rollback están en [el informe de readiness](REF-PUBLICACIONES-SEO-01-readiness.md). La auditoría previa está en [audits/REF-PUBLICACIONES-SEO-01.md](audits/REF-PUBLICACIONES-SEO-01.md).

Reanudado el 17/11/2026 desde el WIP `7ebb55c`, conservando los seis commits de implementación y el árbol limpio inicial. El cierre continúa sus verificadores y documenta los resultados de la revisión local, sin alterar ni reemplazar el WIP.

## Resultado comercial

Publicaciones mantiene su URL y pasa a organizar la oferta por intención: catálogos, revistas, libros y manuales/dossiers. Los dos primeros grupos enlazan a sus landings comerciales y después aparecen proyecto editorial, cinco perfiles profesionales y el catálogo dinámico completo. Se conservan todos los detalles, tipos, formatos, papeles, cubiertas, acabados, proceso y FAQs originales.

La landing de catálogos desarrolla presentación de producto, colecciones, tarifas, formato, materiales, cubiertas y distribución comercial. La de revistas desarrolla comunicación editorial/corporativa, periodicidad, paginación, preparación del lomo, grapado/fresado y continuidad entre ediciones. Comparten presentación y componentes, con contenido específico.

Los presupuestos usan `quote/FormSection.vue`, el endpoint y los eventos existentes. En las landings el formulario recibe el contexto de la publicación. Los enlaces de la categoría utilizan `/pedir-presupuesto?publicacion=editorial`; la página de presupuesto admite también los valores cerrados `catalogos` y `revistas`. Los valores desconocidos mantienen el presupuesto genérico. No se añaden campos obligatorios ni eventos de conversión.

## Reutilización

- De Eventos: `CategoryHero` en variante comercial, `CommercialSolutions` (confianza, agrupaciones, proyecto y casos de uso), `CategoryProductsGrid`, `ContentSectionShell`, `ContentSectionIntro`, `ContentSectionsRenderer`/pestañas, `ContentProcessSteps`, `FaqAccordion`, `SiteBreadcrumbs` y `AppButton`.
- Estilos: `assets/styles/main.scss` sin modificar. Misma Figtree, contenedores, grids, proporciones, botones y breakpoints. `assets/styles/editorial.scss` corrige exclusivamente el contraste dentro de `.editorial-page`: secundarios, breadcrumbs, etiquetas, numeración, pestaña activa y ayudas de formulario, con los tokens corporativos y el gris accesible ya usado por las confirmaciones. Eventos y otras categorías no reciben esta clase.
- Componente nuevo: `components/marketing/landing/EditorialLanding.vue`, que compone los anteriores y el formulario existente. Las dos rutas estáticas son envoltorios de este componente.
- Extensión mínima de `CommercialJson`: aplicaciones y CTA opcionales por grupo, texto del catálogo y CTA opcional del bloque de proyecto. Eventos conserva sus valores y su marcado resultante.
- Contenido comercial de landings: `shared/data/editorialLandings.ts`; rutas, SEO y contextos de presupuesto: `shared/seo/editorialRoutes.ts`. La selección de imágenes está separada en `shared/data/editorialMedia.ts` y se resuelve desde el catálogo y la galería actual. Catálogos usa una publicación abierta con interiores a color; el detalle metalizado pasa al bloque de acabados. Revistas mantiene la imagen existente de grapado.
- CTA secundarios: «Explorar publicaciones», «Ver tipos de catálogos» y «Ver tipos de revistas», conservando sus anclas.
- Navegación: el DTO incorpora dos `commercialLinks` únicamente en Publicaciones, consumidos por las vistas desktop, overflow y móvil. Los productos y sus registros no se alteran; las demás categorías conservan su DTO.

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

Las dos landings también aparecen al inicio del menú de Publicaciones, en desktop y móvil. Los enlaces comerciales se mantienen separados de los productos en los datos de navegación; no se crean fichas ficticias en el CMS.

Blog externo: [la URL indicada](https://blog.reprodisseny.com/como-imprimir-una-revista/) no respondió en la consulta (502). El código actual clasifica ese host como retirado. No se modifica ese sistema. Si el artículo se mantiene o recupera en otro CMS, añadir en su contenido un enlace HTML con texto contextual «impresión de revistas en Barcelona» hacia la nueva landing; confirmar antes quién gestiona ese host. No se ha recuperado contenido histórico íntegro de la antigua ficha; el contenido técnico reutilizado procede del catálogo actual.

## Multimedia y fotografías pendientes

Se han verificado por descarga las dimensiones de seis archivos del CDN: hero 2400×2400; tres detalles y las imágenes de fresado/grapado 1200×1200. Se corrigen únicamente las dimensiones declaradas del hero de la categoría (antes 350×321). Las otras fichas e imágenes se mantienen.

Las imágenes del catálogo son recursos ilustrativos ya publicados. No se acredita que correspondan a encargos reales ni se presentan como trabajos de clientes. No se han generado imágenes ni incorporado bancos externos. Las descargas de auditoría están en `reports/publicaciones-seo/` y no se sirven como nuevos recursos de producción.

Revisión final de recursos existentes: hero de categoría, siete imágenes de encuadernación, tres detalles del registro y `public/img/sliderHome/LibrosRepro.webp`. Se mantiene la composición mixta de Publicaciones. Para Catálogos se reutiliza `product/publicaciones/encuadernacion-cosida-tapa-blanda.webp` (1200×1200), que muestra una publicación abierta e interiores a color; el alt describe lo visible sin atribuirle un cliente ni afirmar que es un catálogo real. La cubierta metalizada de `category/publicaciones imatges/acabados.webp` se reutiliza en el bloque de acabados de Catálogos, con texto a un lado e imagen al otro. Revistas mantiene `product/publicaciones/encuadernado-grapas.webp` (1200×1200). Las otras alternativas mostraban encuadernaciones, un libro cerrado de recetas o una caja de libros; no aportan una composición de catálogos abiertos/cerrados ni distintas ediciones de revistas mejor que los recursos seleccionados.

Inventario de mejora no bloqueante: catálogo comercial real abierto y cerrado en una misma escena, con impresión interior visible; conjunto real de diferentes números de una revista grapada. Publicaciones ya cubre la composición de catálogos, revistas y libros; una fotografía real equivalente sigue siendo una mejora futura, no un requisito de despliegue.

| Ubicación / mejora futura no bloqueante | Ratio / tamaño recomendado | Contenido de una futura fotografía real | Nombre propuesto en la estructura multimedia actual |
| --- | --- | --- | --- |
| Hero Publicaciones | Composición para recorte 8:5, maestro 2400×1500 o superior | Catálogos y revistas abiertos/cerrados sobre fondo neutro, con encuadernación visible | `category/publicaciones imatges/publicaciones-editoriales-hero.webp` |
| Hero Catálogos | 8:5, 2400×1500 | Catálogo comercial real fresado, abierto y cerrado, colección de producto | `category/publicaciones imatges/catalogos-comerciales-hero.webp` |
| Hero Revistas | 8:5, 2400×1500 | Revista real grapada y detalle de apertura, sin datos personales | `category/publicaciones imatges/revistas-grapadas-hero.webp` |
| Ejemplos de soluciones | 1:1, 1200×1200 | Encuadernación, canto y papel de ejemplares reales de fresado/grapado | `category/publicaciones imatges/catalogo-revista-detalle.webp` |
| Acabados | 4:3, 1600×1200 | Laminados y detalle de barniz/stamping/gofrado en una cubierta real | `category/publicaciones imatges/acabados-editoriales-detalle.webp` |

Antes de sustituir archivos: verificar derechos y autorización de reproducción del proyecto; subir por el sistema multimedia actual y actualizar la selección de imagen y sus dimensiones. Los nombres propuestos son inventario, no referencias a archivos existentes.

## Validaciones y evidencias

Validación local terminada el 17/11/2026 con Node `22.23.1`, sobre el build final de dirección de arte. Logs y artefactos: `reports/publicaciones-seo/` (directorio ignorado por Git). No se escriben solicitudes en SharePoint ni se envían correos: las pruebas de navegador interceptan las escrituras antes de que alcancen el backend.

| Comprobación | Resultado | Evidencia local |
| --- | --- | --- |
| `npm test`, reutilizando el preview con `CATEGORY_TABS_BASE_URL` | 311/311; ninguna omitida | `tests-art.log` |
| `vue-tsc --noEmit -p tsconfig.json`, con los tipos generados por Nuxt | Correcto, sin errores de tipos; el helper local ya no importa globals del bundle generado | `typecheck-art.log` (salida 0) |
| `npm run validate:seo` | Contenido y rutas correctos; 363 redirects, 31 reglas 410 y 3 reglas 404; cero errores o warnings del validador | `seo-art.log` |
| `npm run build`, con origen y entorno de producción explícitos | Correcto; se usa el output de este build en el preview | `build-art.log` |
| `node scripts/verify-publicaciones-integrity.mjs` | 118 productos y otras 11 categorías conservados; contenido técnico y estilos intactos | `integrity.json` |
| `node scripts/verify-publicaciones-http.mjs` | 159/159 | `http-results.json`, `http-art.log`, HTML de las cuatro páginas y `robots.txt` |
| `node scripts/verify-publicaciones-responsive.mjs` | 137/137 | `responsive/results.json`, `browser-art.log` y capturas PNG |
| `node scripts/prepare-publicaciones-cms.mjs --read-cms` | Payload local coherente; esquema confirmado; siete campos pendientes de autorización e integración | `cms-preflight.json` y backup inmutable `cms-before-<fecha>.json` |

La comprobación HTTP valida respuestas 200, un único H1 y canonical autorreferente, títulos y descripciones propios, idioma, indexabilidad por meta y cabecera, imágenes prioritarias y alt, JSON-LD y correspondencia de FAQs, contenido técnico en SSR, siete fichas, enlaces de homepage y navegación comercial, CTA secundarios personalizados, sitemap público, robots, anclas y los dos 301 directos de revistas.

Revisión responsive de Publicaciones, Catálogos, Revistas y Eventos a 320, 360, 390, 768, 1280, 1440 y 1920 px, sin desbordamiento horizontal. Se comprueba además el reflujo equivalente al 200% de zoom de un viewport de 1280 px (640 px CSS, densidad 2), carga de imágenes al recorrer la página, foco y navegación por teclado y pestañas técnicas. En las tres páginas editoriales se mide el contraste de todos los elementos visibles con texto directo, incluidos introducciones, etiquetas, breadcrumbs y ayudas del formulario: al menos 4,5:1 para texto normal o 3:1 para texto grande. Se verifican las dos landings al abrir los menús desktop y móvil. Las mediciones de fuente, tamaño, interlineado, color de H1, contenedor y botón principal coinciden con Eventos. No se detectan errores de ejecución ni desajustes de hidratación.

Los cinco envíos simulados cubren ambos formularios de landing y `/pedir-presupuesto?publicacion=catalogos`, `revistas` y `editorial`: una solicitud interceptada y una conversión por recorrido, conservando publicación y categoría. La revisión visual incluye capturas completas de las tres páginas a 1440 px, con las imágenes diferidas cargadas, y `responsive/publicaciones-proyecto-320.png` como evidencia del CTA corregido. Los datos de CLS recogidos durante cambios de viewport no son métricas de campo ni una certificación de Core Web Vitals.

Para repetir `npm test` con el preview ya arrancado en PowerShell: `$env:CATEGORY_TABS_BASE_URL='http://127.0.0.1:3100'`. El navegador integrado sigue sin arrancar por infraestructura; toda la revisión de navegador se ha completado con Chrome local, sin instalar paquetes.

Comprobación de integridad contra `b4f0686`: los 118 registros de productos y las otras 11 categorías son idénticos. En Publicaciones son idénticos ID, path, secciones técnicas, proceso, FAQs, relaciones y breadcrumbs. CSS global y `CategoryHero` también son idénticos. Evidencia: `integrity.json`.

La ampliación de la revisión a 320 px detectó un desbordamiento de 19 px en el bloque de proyecto editorial: el CTA «Solicitar presupuesto personalizado» forzaba el ancho de su columna. Se unifica el texto con «Solicitar presupuesto», conservando `/pedir-presupuesto?publicacion=editorial`. La corrección se limita a ese campo de Publicaciones, sin cambios en componentes o CSS compartidos.

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
- `assets/styles/editorial.scss`, `shared/navigation.ts`, `components/layout/SiteHeader.vue`, `components/shared/menu/Categorias.vue`
- `scripts/prepare-publicaciones-cms.mjs`, `docs/cms/publicaciones-editorial.fields.json`, `docs/REF-PUBLICACIONES-SEO-01-readiness.md`
- `redirect-rules.generated.ts`, `scripts/validate-seo-redirects.ts`
- `scripts/verify-publicaciones-http.mjs`, `scripts/verify-publicaciones-responsive.mjs` (nuevos)
- `scripts/verify-publicaciones-integrity.mjs` (compara datos y componentes conservados con la base, sin modificar el checkout)
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

1. Dirección de arte aprobada. Conservar la misma rama para revisión del cierre; no fusionar ni promover deployments sin autorización.
2. La lectura del CMS confirma que los siete campos están pendientes y que `CommercialJson` existe como texto plano multilínea editable, sin anexado. El payload exacto y el preflight de lectura están preparados. Seguir [la integración de CMS](REF-PUBLICACIONES-SEO-01-readiness.md) antes de sincronizar; no ejecutar `generate` como sustituto del build. No hay overrides ni un segundo CMS.
3. El check del commit de `main` confirma integración con el proyecto Vercel existente. La configuración privada de Production Branch y Build Command se confirma en ese proyecto antes de publicar; no se cambia en esta entrega. El procedimiento y rollback están en [readiness](REF-PUBLICACIONES-SEO-01-readiness.md).
4. Construir con el origen público de producción configurado: `NUXT_SITE_ENV=production`, `NUXT_SITE_URL=https://reprodisseny.com`, `NUXT_PUBLIC_SITE_URL=https://reprodisseny.com`. En previsualizaciones compartidas conservar las protecciones de noindex del entorno.
5. Ejecutar tests, typecheck, validadores SEO y build. Sobre un preview aislado comprobar las tres páginas, siete fichas, sitemap, canonical, 301 y formulario con transporte simulado. El directorio `reports` y el bootstrap de Windows son solo herramientas locales.
6. Publicar únicamente con aprobación expresa. Comprobar en producción respuestas 200/301, sitemap y canonical, y una conversión controlada con consentimiento y herramientas de diagnóstico del sistema actual. No se duplica instrumentación.
7. Rollback: restaurar el artefacto anterior mediante el mecanismo real del hosting. Alternativamente revertir los commits de esta entrega en orden inverso y reconstruir. Si se actualizaron los campos fuente del CMS, restaurar también sus valores anteriores para mantener coherencia con el snapshot. No eliminar las nuevas URLs de una publicación ya indexada sin decidir su destino SEO.

## Seguimiento SEO

Datos de partida: los facilitados en el encargo, analizados el 16/11/2026. No se interpretan como prueba de canibalización ni como garantía de crecimiento.

| Plazo desde el despliegue | Comprobaciones y decisiones |
| --- | --- |
| 30 días | Inspeccionar las tres URLs en Search Console: descubrimiento, indexabilidad, canonical elegido, sitemap y estado del 301. Comparar impresiones/clics/CTR/posición por página y por consultas de catálogos y revistas. Confirmar que los presupuestos conservan la publicación y que no se duplican conversiones. |
| 60 días | Comparar ventanas equivalentes y segmentar consultas, dispositivo y página. Revisar qué página responde a cada intención, sin asumir canibalización por coexistencia de impresiones. Si hay impresiones relevantes con CTR bajo, revisar snippet y propuesta comercial; incorporar fotos reales disponibles. |
| 90 días | Evaluar tendencia y solicitudes comerciales atribuidas por publicación. Revisar enlaces internos y calidad de visitas/presupuestos con el equipo comercial. Ajustar contenido con evidencia; mantener las URLs y priorizar las consultas con oportunidad constatada. |

La indexación efectiva, las métricas de campo y los resultados comerciales se verificarán después de desplegar; un build local no los demuestra.
