# SEO-PUBLICACIONES-02 — Consolidación comercial y cierre

Fecha de auditoría: 17/11/2026. Continuación incremental de REF-PUBLICACIONES-SEO-01 en `feat/publicaciones-editorial-seo`. No se inicia otra refactorización. Este documento sustituye las recomendaciones anteriores que sugerían intervenir en el blog: el blog antiguo queda excluido, sin lecturas, contenidos, enlaces nuevos ni cambios en su funcionamiento.

## Estado encontrado y alcance

Se recuperaron el WIP `7ebb55c`, el cierre visual `a3b87a2` y la integración documentada en `945fec5`. El [PR #7](https://github.com/devRepro/reprodisseny/pull/7) seguía abierto, sin conflictos con `main`, con Preview Vercel satisfactorio. Producción seguía en `b4f0686fb83caba064915875ebc801ba5176d172`; la comprobación HTTP pública del 17/11 devuelve Publicaciones 200 y Catálogos/Revistas 404, pues las nuevas landings no estaban publicadas. La autorización anterior permitió integrar los siete campos del CMS, operación completada y verificada antes de este incremento. No se considera esa autorización una aprobación automática de los nuevos cambios SEO-02.

Los resultados citados de 310 tests, 153 comprobaciones HTTP y 133 de navegador correspondían a un punto anterior. El cierre funcional posterior, conservado en esta rama, tenía 311/159/137. Los resultados de esta entrega se registran más abajo después de repetir las pruebas afectadas.

Ya estaban resueltos: arquitectura comercial de Publicaciones, dos landings originales, navegación y homepage, encuadernaciones, papeles/cubiertas/acabados, periodicidad, archivos, FAQs, presupuesto contextual, metadatos, datos estructurados, sitemap, 301 históricos, contraste y desbordamiento. Se conservan imágenes, heroes, H1, URLs, fuentes, tokens y componentes. Las siete fichas técnicas mantienen identificadores, contenido, URLs y funcionalidad.

## Cambios necesarios

- Revistas: una sección de formatos A4 (210 × 297 mm), A5 (148 × 210 mm) y personalizados, con aplicaciones profesionales; una FAQ de formatos; mayor claridad del público B2B y de la personalización. El singular «imprimir una revista personalizada» se integra en la preparación del presupuesto, sin prometer producción unitaria.
- Catálogos: ejemplos industriales, mobiliario y moda; ferias, congresos, showrooms y presentaciones; criterios de elección de encuadernación y acceso a Wire-O/tapa dura ya existentes; referencia natural a producción de catálogos.
- Ambas: CTA principal específico («Solicitar presupuesto de revistas/catálogos»), conservando el secundario aprobado, y explicación de los ocho datos útiles para presupuestar. Sin campos obligatorios nuevos, precios, límites de páginas, tiradas mínimas ni compromisos de plazo.
- Metadescripciones ajustadas a las propuestas del responsable; titles y H1 existentes conservados. El título amplio actual de Publicaciones ya distingue su intención editorial y evita una ampliación innecesaria del payload CMS.
- Enlaces contextuales descritos abajo. No se alteran secciones ni diseño de Eventos u otras fichas.

Las capacidades no se deducen de Semrush: formatos, materiales y acabados proceden del catálogo técnico actual; digital y offset ya están declarados en la homepage comercial (`pages/index.vue`). Se explica su elección según el trabajo, sin inventar maquinaria, tolerancias ni disponibilidades específicas. Se mantienen las fotografías del sistema multimedia actual; el inventario de sustituciones futuras del informe REF sigue siendo no bloqueante. No se añaden imágenes externas o generadas.

## Matriz keyword–URL–contenido

Datos de Semrush España (17/11/2026) y posiciones históricas GSC facilitados por el responsable, no extraídos ni actualizados por estas pruebas. Volumen mensual estimado y KD son referencias, no resultados ni demanda agregable: las variantes se solapan. `—` significa dato no facilitado.

Destinos: **R** = `/productos/impresion-revistas-barcelona`; **C** = `/productos/impresion-catalogos-barcelona`; **P** = `/categorias/libros-revistas-catalogos`. R y C responden a contratación B2B; P a exploración editorial. P1 = prioridad comercial principal; P2 = apoyo; seguimiento = sin nueva traducción/ruta. Indicadores: **L** solicitudes y leads cualificados por landing; **F** consulta de ficha técnica; **E** tránsito hacia una landing especializada. Los tres se interpretan junto con impresiones, clics y CTR por consulta/URL.

| # | Consulta | Intención / URL | Bloque | Prioridad | Volumen / KD | Posición GSC | Indicador |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | imprimir revista | Contratar / R | Hero, presupuesto | P1 | 720 / 9% | — | L |
| 2 | imprimir revista personalizada | Contratar / R | Hero, presupuesto | P1 | 590 / 17% | — | L |
| 3 | imprimir revistas | Contratar / R | Hero, producción | P1 | 480 / 19% | — | L |
| 4 | impresion de revistas | Contratar / R | Hero, encuadernaciones | P1 | 170 / 13% | — | L |
| 5 | impresion revistas | Contratar / R | Hero, producción | P1 | 170 / 15% | — | L |
| 6 | revistas personalizadas | Contratar / R | Hero, aplicaciones | P1 | 140 / 10% | — | L |
| 7 | impresión de revistas | Contratar / R | Hero, producción | P1 | 110 / 11% | — | L |
| 8 | imprimir revistas grapadas | Elegir/contratar / R | Encuadernaciones, paginación; ficha grapado | P1 | 90 / 11% | — | L, F |
| 9 | impresión revistas | Contratar / R | Hero, producción | P2 | 70 / 4% | — | L |
| 10 | imprimir revistas personalizadas | Contratar / R | Hero, aplicaciones | P1 | 50 / 16% | — | L |
| 11 | imprimir revistas A5 | Elegir/contratar / R | Formatos, FAQ A4/A5 | P2 | 50 / 3% | — | L |
| 12 | imprimir revistas A4 | Elegir/contratar / R | Formatos, FAQ A4/A5 | P2 | 40 / 9% | — | L |
| 13 | impressió de revistes | Contratar / R | Oferta equivalente; sin traducción | Seguimiento | 40 / 7% | 6,11 | L |
| 14 | imprenta de revistas | Contratar / R | Producción, proceso | P2 | 20 / 9% | — | L |
| 15 | impresion revistas barcelona | Contratar local / R | Title, H1, presupuesto | P1 | — / — | 12,64 | L |
| 16 | imprimir revistas barcelona | Contratar local / R | Title, hero, presupuesto | P1 | — / — | — | L |
| 17 | presupuesto impresión revistas | Solicitar oferta / R | Presupuesto, FAQ | P1 | — / — | — | L |
| 18 | impresion de catalogos | Contratar / C | Title, hero, producción | P1 | 390 / 14% | — | L |
| 19 | impresión de catálogos | Contratar / C | Title, hero, producción | P1 | 320 / 29% | — | L |
| 20 | impresion catalogos | Contratar / C | Hero, producción | P1 | 260 / 21% | — | L |
| 21 | imprimir catalogos | Contratar / C | H1, presupuesto | P1 | 210 / 12% | — | L |
| 22 | imprimir catálogos | Contratar / C | H1, presupuesto | P1 | 170 / 28% | 26,10 | L |
| 23 | impresion catalogo | Contratar / C | Hero, aplicaciones | P2 | 110 / 9% | — | L |
| 24 | imprenta catalogos | Contratar / C | Producción, proceso | P2 | 70 / 13% | — | L |
| 25 | producción de catálogos | Contratar / C | Producción | P1 | 70 / 7% | — | L |
| 26 | catálogos personalizados | Contratar / C | Descripción, aplicaciones, materiales | P1 | 50 / 12% | — | L |
| 27 | impresion catalogos barcelona | Contratar local / C | Title, hero, presupuesto | P1 | 40 / 9% | 10,82 | L |
| 28 | impressió de catàlegs | Contratar / C | Oferta equivalente; sin traducción | Seguimiento | 40 / 6% | — | L |
| 29 | impresión de catálogos barcelona | Contratar local / C | Title, hero, presupuesto | P1 | 10 / 8% | 14,57 | L |
| 30 | impresión de revistas y catálogos | Explorar oferta / P | Hero, grupos comerciales | P1 | — / — | — | E, L |

Consulta histórica complementaria: «imprimir catalogos barcelona», posición GSC 12,75, destino C, prioridad P1, sin volumen/KD acreditados. Catálogos para empresas, comerciales, industriales, para ferias, premium y de producto son extensiones semánticas sin métricas asignadas. Publicaciones conserva la impresión editorial/corporativa, libros, manuales/dossiers, asesoramiento y catálogo técnico completo; no replica la especialización de las landings. Las fichas resuelven detalles técnicos, no sustituyen la intención comercial.

Se mantienen las etiquetas Semrush existentes `PUBLICACIONES_REVISTAS`, `PUBLICACIONES_CATALOGOS`, `PUBLICACIONES_GENERAL`. No se modifica Semrush, Google Ads ni se crean URLs por acentos, localidad, singular, plural, formato o catalán. El contenido visible está correctamente acentuado; no se incorporan meta keywords.

## Enlazado y metadatos definitivos

Ya existentes: homepage → ambas landings; Publicaciones → Catálogos/Revistas; menús desktop/móvil → ambas; landings → Publicaciones y fichas. Este incremento añade Catálogos → Eventos («Material gráfico para eventos y ferias»), Eventos → Catálogos («catálogos comerciales para ferias») dentro del texto de proyecto actual; grapado → Revistas; fresado → Catálogos; cosida blanda y Wire-O → Publicaciones. Enlaces HTML rastreables, sin registros de productos ficticios ni cambios en el contenido técnico del CMS.

| Página | Title conservado | H1 conservado |
| --- | --- | --- |
| P | Catálogos, revistas y libros en Barcelona \| Repro Disseny | Impresión de catálogos, revistas y libros en Barcelona |
| C | Impresión de catálogos en Barcelona \| Repro Disseny | Imprimir catálogos profesionales en Barcelona |
| R | Imprimir revistas en Barcelona \| Repro Disseny | Impresión de revistas personalizadas en Barcelona |

Metadescripciones:

- P: «Impresión editorial y corporativa en Barcelona: catálogos, revistas, libros y manuales. Te asesoramos en papel, encuadernación y acabados. Pide presupuesto.»
- C: «Imprimimos catálogos personalizados, comerciales y de producto en Barcelona. Diferentes formatos, papeles, encuadernaciones y acabados. Solicita presupuesto.»
- R: «Imprimimos revistas personalizadas, corporativas y editoriales en Barcelona. Revistas grapadas y fresadas, formatos A4, A5 y especiales. Solicita presupuesto.»

Canonical autorreferente sin parámetros en las tres rutas. Se conserva Open Graph, breadcrumbs y JSON-LD validado; FAQs visibles mediante acordeón accesible y coherentes con el marcado, sin prometer resultados enriquecidos. No se inventan precios, reseñas ni disponibilidad. Los dos 301 históricos de revista terminan directamente en R; no se interviene en el blog.

## Componentes y archivos

Reutilizados: `CategoryHero`, `CommercialSolutions`, `CategoryProductsGrid`, `ContentSectionShell`, `ContentSectionIntro`, `ContentSectionsRenderer`, `ContentProcessSteps`, `FaqAccordion`, `SiteBreadcrumbs`, `AppButton`, `EditorialLanding` y `quote/FormSection`. Una ranura opcional permite el enlace contextual en el párrafo existente de Eventos. Los CTA largos admiten salto de línea solo dentro de `.editorial-page`.

Archivos del incremento:

- `shared/data/editorialLandings.ts`: contenido y enlaces de secciones.
- `shared/seo/editorialRoutes.ts`: descripciones y cuatro enlaces contextuales técnicos.
- `components/marketing/landing/EditorialLanding.vue`: CTA específico y enlaces opcionales.
- `assets/styles/editorial.scss`: ajuste local de salto de línea del CTA.
- `components/marketing/category/CommercialSolutions.vue`: ranura opcional.
- `pages/categorias/[...slug].vue`: enlace contextual de Eventos.
- `pages/productos/[...slug].vue`: cuatro enlaces técnicos condicionales.
- `tests/publicaciones-editorial.test.ts`: cobertura de formatos, presupuesto e integridad de destinos.
- `scripts/verify-publicaciones-http.mjs`: cobertura SEO y enlaces ampliada.
- `scripts/verify-publicaciones-responsive.mjs`: atribución publicitaria y observación de rendimiento de laboratorio.
- Este documento y los dos informes REF: estado, exclusión del blog y publicación.

Sin cambios en `cms/catalog.json`, payload de siete campos, dependencias, CSS global, `CategoryHero`, campañas, CRM, autenticación, sistemas internos o registros de otras categorías.

## CMS, publicación y rollback

Los siete campos **ya están integrados**, no pendientes: `Title`, `Description`, `MetaTitle`, `MetaDescription`, `ImageWidth`, `ImageHeight`, `CommercialJson`, únicamente Publicaciones ID 7 de `WebCatetories`. Lectura posterior sin diferencias; sincronización con 118 productos/12 categorías, cero modificaciones y cero errores. SEO-02 no cambia ese payload ni requiere nuevas columnas/productos/escrituras remotas. Los contenidos de landings siguen en su fuente existente; no se crea otro CMS ni se duplican los campos gestionados por SharePoint.

Backup anterior a la operación: `reports/publicaciones-seo/release/cms-seven-before-2026-11-17T14-08-01-272Z.json`, objeto `fields`; informe verificado `release/cms-applied.json`. Conservarlos fuera de Git y no sustituirlos por una copia posterior. Integración y compatibilidad detalladas en [readiness REF](REF-PUBLICACIONES-SEO-01-readiness.md).

1. Revisar el diff final y autorizar expresamente el SHA de SEO-02. Confirmar PR sin conflictos y checks del mismo SHA satisfactorios. No activar auto-merge.
2. Ejecutar el preflight de lectura `node scripts/prepare-publicaciones-cms.mjs --read-cms --require-integrated` y `npm run sync:cms:check`. No reescribir los siete valores si ya coinciden, ni incluir ediciones concurrentes ajenas.
3. Confirmar en el proyecto Vercel existente la rama de producción y configuración, guardar deployment/SHA estable y conservar backup CMS. Construir con Node 22 y lockfile, `NUXT_SITE_ENV=production`, URLs de sitio `https://reprodisseny.com`. El artefacto utiliza el snapshot y multimedia reales, sin mocks ni archivos de reports.
4. Tras autorización, fusionar PR #7 y seguir el deployment automático del mismo SHA en Vercel. No mezclar promoción manual y despliegue Git de revisiones distintas.
5. En producción, validar las tres URLs 200, canonical, H1/titles/descripciones/OG, HTML principal, sitemap/robots/indexabilidad, imágenes y enlaces; ambos 301 históricos de revista; formularios sin enviarlos. Verificar que no haya noindex heredado del Preview y contrastar Eventos/otras categorías. No ejecutar el bucle de formularios interceptados contra producción ni generar conversiones publicitarias de prueba.
6. Registrar SHA publicado, deployment ID/estado y evidencias de producción. Solo entonces marcar el proyecto publicado e iniciar el cómputo SEO de 30/60/90 días.

Rollback: volver al deployment estable `b4f0686fb83caba064915875ebc801ba5176d172` (GitHub deployment Production `7493712195`, Vercel `reprodisseny-b0o7m2rs3-reprodevs-projects-838aa4b3.vercel.app`) o a su sustituto estable recién verificado. Revertir el merge por el flujo normal, sin reset/force-push de `main`. Si se revierte toda REF, restaurar exclusivamente los siete valores del backup sobre ID 7 con eTag fresco/If-Match y comprobar coherencia del snapshot; si solo se retira SEO-02 y se conserva REF, no restaurar campos que SEO-02 no modifica. Detener ante una incompatibilidad o check crítico fallido; no escribir CMS para intentar arreglar un error de código.

## Validaciones de esta versión

Resultados sobre el build de producción de SEO-02 (Node 22):

| Comprobación | Resultado |
| --- | --- |
| Suite unitaria e integración existente | **312/312**, cero omitidas/canceladas |
| Typecheck (`vue-tsc --noEmit -p tsconfig.json`) | Correcto, exit 0 |
| `npm run validate:seo` (contenido, rutas, redirecciones) | Correcto, cero errores bloqueantes |
| `npm run build` con entorno de producción | Correcto |
| HTTP, SSR, metadatos, schema, sitemap, robots, enlaces y 301 | **176/176** |
| Navegador, responsive, accesibilidad, imágenes y formularios | **141/141**, cero errores de ejecución/hidratación |
| Formularios | Cinco transportes interceptados; ninguna solicitud real |
| Integridad contra `b4f0686` | 118 productos, otras 11 categorías y contenido técnico intactos; configuración de Eventos, CSS global y hero intactos |
| CMS lectura `--require-integrated` | Siete campos coincidentes, cero pendientes |
| Rama contra `origin/main` tras fetch | Base sin cambios; sin conflicto |

El PR #7 permanece abierto, sin conflictos con `main`. El commit funcional validado `aa345aaa3ed3cc28ce40d7d33baa3b204e7b441c` tiene check Vercel y «Vercel Preview Comments» satisfactorios; deployment Preview GitHub `7856786119`, estado success, [registro Vercel](https://vercel.com/reprodevs-projects-838aa4b3/reprodisseny/9eHFFn5Nomo2FZeAgRdyLBEcQrkP). El repositorio no tiene workflows GitHub Actions; el despliegue/check Vercel es la verificación remota existente. Los commits posteriores que solo registren estas evidencias no alteran el código probado; consultar siempre los [checks del SHA de cabeza](https://github.com/devRepro/reprodisseny/pull/7/checks) antes de fusionar. No confundir Preview con producción.

La protección de `main` exige **una revisión aprobada** (`required_approving_review_count=1`, `dismiss_stale_reviews=true`); el PR figura `REVIEW_REQUIRED`. No se elude esa regla. Junto con la autorización vigente para SEO-02, es el paso real pendiente antes de la fusión. No queda integración CMS pendiente.

La petición anónima al Preview remoto devolvió 302 y cabecera `noindex`; no se presenta esa respuesta como auditoría del HTML remoto. El estado del deployment se verificó mediante GitHub/Vercel y la inspección completa se realizó sobre el build local con entorno de producción. La indexabilidad pública definitiva se comprueba después de la publicación autorizada.

Evidencias locales bajo `reports/publicaciones-seo/seo-02-*.log`, `http-results.json`, `integrity.json` y `responsive/results.json`; capturas desktop/móvil y página completa en `responsive/`. No se versionan datos operativos. Preview local conservado en `http://127.0.0.1:3100`, con las tres rutas aprobadas y los datos reales del snapshot. Se revisaron las capturas de los heroes y la página completa; se mantiene la alternancia existente de producto, texto, fotografía de acabados, proceso, FAQs y presupuesto, con una única sección nueva de formatos en Revistas.

No hay script/configuración de lint en el repositorio: no se añade una herramienta ni se presenta un lint inexistente como ejecutado. Se usan typecheck, suite existente, validadores de contenido/SEO, build, revisión del diff y verificadores HTTP/navegador.

Las comprobaciones de navegador cubren 320, 360, 390, 768, 1280, 1440, 1920 px y reflujo equivalente al 200%, contraste, foco, imágenes, navegación y cinco formularios. Todo POST se intercepta antes de llegar a la API; los terceros de analítica/publicidad se bloquean. Se comprueba un único `generate_lead` local por confirmación, contexto de publicación y conservación UTM/GCLID en `sourceUrl` y atribución normalizada. No se alteran consentimiento, analítica ni campos del formulario. El GCLID se conserva para el transporte existente cuando llega en la URL; no se inventa integración de conversiones offline ni se verifica una campaña real.

El verificador registra LCP, CLS antes de cambiar viewport, TTFB y máxima duración de eventos observados, en localhost a 1440 px sin limitación de red/CPU. Es una muestra de laboratorio, no INP de campo ni un informe CrUX; las métricas de usuarios se revisarán tras publicar. [Definición oficial de Web Vitals](https://web.dev/articles/vitals).

| Página | LCP local | CLS antes de resize | TTFB local | Máximo evento observado |
| --- | --- | --- | --- | --- |
| Publicaciones | 1264 ms | 0,0959 | 298 ms | 184 ms |
| Catálogos | 660 ms | 0,0049 | 130 ms | 48 ms |
| Revistas | 592 ms | 0,0049 | 159 ms | 16 ms |
| Eventos (referencia) | 668 ms | 0,0049 | 174 ms | 48 ms |

Son observaciones de una ejecución, sensibles a caché, red y equipo; no se extrapolan a móviles reales ni se presentan como mejora respecto a una línea base inexistente. No hay bloqueos técnicos detectados. Quedan la autorización del SHA ampliado, la fusión/despliegue y sus verificaciones en producción; ninguna operación CMS adicional ni sustitución fotográfica bloquea este cierre.

## Inspección y seguimiento SEO

Después de publicar, inspeccionar las tres URLs en la propiedad correcta de Google Search Console: prueba en directo, canonical declarado/elegido, HTML renderizado y permiso de indexación. Solicitar indexación si procede; revisar el sitemap público ya existente y su lectura en GSC. Vigilar el destino final y los informes de la antigua ruta de revista, sin solicitar la indexación del blog. Una solicitud no garantiza inclusión ni un plazo; repetirla no acelera el rastreo. [Procedimiento oficial de Google](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).

Línea base histórica aportada: crecimiento general de clics +66,9%, posición media 29,78 → 19,16; Catálogos 918 impresiones/3 clics/CTR 0,33%/posición 33,64; Revistas 71 impresiones/0 clics/posición 10,15. No representan mediciones posteriores a esta implementación. Guardar fechas y filtros comparables al iniciar el seguimiento, separando marca/no marca, dispositivo, consulta y URL.

| Momento desde publicación | Revisión | Decisión |
| --- | --- | --- |
| 30 días | Indexación/canonical/sitemap, 301, impresiones/clics/CTR por familia y URL, consultas nuevas, leads atribuidos y calidad; revisar LCP/CLS/INP de campo si hay muestra | Corregir incidencias reales; no interpretar ausencia de datos como resultado cero ni prometer posiciones |
| 60 días | Comparación con periodo equivalente y estacionalidad, URLs que compiten por intención, CTR según posición, tráfico no marca, uso móvil y presupuestos cualificados | Ajustar snippets/contenido solo con evidencia; conservar arquitectura aprobada |
| 90 días | Evolución por etiqueta Semrush, consultas nuevas y URLs posicionadas, solicitudes, leads cualificados y pedidos vinculados cuando existan datos | Recalibrar objetivos y priorizar mejoras comerciales; preparar campañas separadas de Catálogos, Revistas y Publicaciones en otro proyecto |

Objetivos aspiracionales a 90 días: «impresión catálogos Barcelona» Top 5; «imprimir catálogos Barcelona» e «impresión revistas Barcelona» Top 10; «impressió de revistes» Top 3–5; «imprimir revistas grapadas» Top 10–20; «imprimir revista», «imprimir revista personalizada», «imprimir revistas», «catálogos personalizados», «imprimir catálogos» e «impresión de catálogos» Top 20. No son garantías y se ajustan a los primeros datos. No sumar volúmenes de variantes ni valorar éxito únicamente por posiciones.
