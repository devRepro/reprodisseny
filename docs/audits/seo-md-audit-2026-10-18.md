# Auditoría maestra de documentación y SEO — Repro Disseny

- Fecha de corte: **2026-10-18**
- Repositorio auditado: `devRepro/reprodisseny`
- Copia de trabajo: `/Users/jofuentesle/Documents/ProyectosWeb/reprodisseny`
- Web contrastada: [https://reprodisseny.com](https://reprodisseny.com)

## 1. Resumen ejecutivo

La base técnica SEO del sitio principal está considerablemente más madura que la documentación que la describe. El repositorio local contiene canonicals, sitemap dinámico, robots, `noindex` selectivo, tratamiento de 404/410, redirecciones legacy, enlazado de catálogo, datos estructurados prudentes, consentimiento y medición de formularios. Las validaciones locales han pasado y una muestra pública fechada confirma gran parte de esa implementación. Esto **no equivale** a demostrar cobertura o rendimiento orgánico en Google: faltan datos actuales de Search Console, Semrush, GA4/Ads y Core Web Vitals de campo.

El problema documental es estructural: de los **37 documentos y artefactos preexistentes** inventariados no hay ninguno que pueda considerarse, por sí solo, manual maestro vigente. Hay 18 obsoletos, 5 duplicados, 4 contradictorios, 7 históricos útiles, 1 sustituido, 1 pendiente de verificación y 1 fuera del alcance SEO. La mayor parte de `content/_docs/` y `plantillas/` describe el catálogo Markdown retirado; no alimenta la web actual.

Los riesgos prioritarios encontrados son:

1. **Exposición histórica de un secreto:** un documento ya eliminado, `content/docs/memoria.md`, contenía una credencial SendGrid en texto plano y sigue recuperable desde el historial anterior al commit `63f3da3`. No se reproduce el valor en este informe. Debe revocarse/rotarse y auditarse su uso antes de plantear, de forma coordinada, cualquier saneamiento de historial.
2. **Blog técnicamente bloqueado:** el 2026-10-18 `https://blog.reprodisseny.com/robots.txt` devolvía `Disallow: /` y el certificado TLS no correspondía al host. El repositorio solo puede canonicalizar ese host si la petición alcanza Nuxt; hoy el servidor observado es Nginx externo.
3. **Copia local desfasada:** `main` local (`2aa7538`) está dos commits detrás de `origin/main` (`4ba8309`). La corrección `81fb91f`, que evita un falso éxito del formulario general y mejora la accesibilidad del error, está en `origin/main`, no en el HEAD auditado. No se ha determinado el SHA desplegado en Vercel.
4. **Cadena externa de calendarios:** `calendarios.reprodisseny.com/` ya no sirve la antigua página indexable, pero el 2026-10-18 encadenaba `301` a `/productos/calendarios-personalizados` y otro `301` a la landing 2027. La primera regla reside en Netlify/DNS, fuera de este repositorio.
5. **Fuentes de validación envejecidas:** `scripts/validate-seo-http.ts` calcula correctamente resultados HTTP, pero incrusta texto fijo con “357 redirects” y un `typecheck` fallido. Hoy el validador estático cuenta **362 redirects**, **31 reglas 410**, **3 respuestas 404 explícitas** y el typecheck pasa.

Conclusión: no hace falta una nueva refactorización SEO general ni nuevas URLs. Primero hay que cerrar seguridad, subdominios, paridad de despliegue y datos externos; después se deben priorizar contenidos y CRO con consultas e impacto real.

## 2. Estado Git y alcance real de la auditoría

### 2.1 Estado observado antes de crear estos entregables

| Comprobación | Resultado |
| --- | --- |
| Rama local | `main` |
| HEAD local | `2aa7538028a4bee755206fef41a39974fbe48ade` — `feat(seo): optimize adhesives category content` — 2026-10-14 |
| Referencia local `origin/main` | `4ba83095b7bd50bb3a7b65e5cea7bcf2da53c0b7` — merge del arreglo consolidado de formularios — 2026-10-16 |
| Última actualización observada de `origin/main` | reflog local: fetch fast-forward el 2026-10-18 19:30:29 +02:00 |
| Divergencia | `0` commits locales exclusivos; `2` commits por detrás |
| Diferencia HEAD → `origin/main` | solo `components/marketing/quote/FormSection.vue`, 4 inserciones y 7 eliminaciones |
| Cambios locales preexistentes | ninguno mostrado por `git status -sb` antes de la auditoría |

Los dos commits que faltan en la copia local son `81fb91f` y el merge `4ba8309`. En el HEAD local, el honeypot del formulario navega a `/gracias` aunque no crea una solicitud ([`components/marketing/quote/FormSection.vue:160`](../../components/marketing/quote/FormSection.vue#L160)); en `origin/main`, esa rama muestra error y añade `role="alert"`. No se ha cambiado de rama ni se ha ejecutado `pull`, `merge`, `rebase`, `reset` o `checkout`.

La salida pública de robots y sitemap coincide con la compilación local auditada —robots es idéntico y el sitemap solo difiere en el timestamp generado—, pero esto **no identifica el commit exacto desplegado** ni permite asumir que el arreglo de formularios de `origin/main` esté en producción.

### 2.2 Ramas no integradas en `origin/main`

Los números son `commits en origin/main que faltan en la rama / commits exclusivos de la rama`.

| Rama | Divergencia | Contenido exclusivo | Dictamen |
| --- | ---: | --- | --- |
| `origin/fix/quote-form-calendars` | 11 / 1 | `53fb7c5`, 15 ficheros de formularios, backend y pruebas | **Relevante.** Reconciliar contra `origin/main`; no hacer merge ciego porque la consolidación posterior cubre parte del problema. |
| `origin/fix/home-responsive-image-sizing` | 49 / 1 | `61f45e2`, dos líneas y una prueba | Revisión humana; puede haber quedado superada por cambios de rendimiento posteriores. |
| `origin/work/seo-organic-20260723` | 107 / 7 | noindex antiguo, auditor de contenido y schema anterior | Mayoritariamente sustituida por implementación posterior; no tratarla como trabajo listo para integrar. |
| `fix/seo-sitewide-schema` | 130 / 1 | `bc0fc9f`, retirada de rating del carrusel | Sustituida por la limpieza posterior de structured data integrada en `main`. |
| `origin/feat/cookieconsent-migration` | 51 / 1 | WIP inicial de CookieConsent | Obsoleta: la migración completa ya está en `main`. |
| `work/next` y `origin/work/next` | 155 / 10 | mezcla de UI, dependencias y “refactor seo” | Rama amplia y envejecida; requiere inventario propio, no se considera backlog SEO aprobable. |
| `backup/work-next-before-main-merge` | 159 / 5 | cambios antiguos de catálogo/formularios | Copia de seguridad histórica; no equivale a funcionalidad pendiente. |

Las ramas históricas `perf/defer-gtm` y otras correcciones SEO ya están contenidas en `origin/main`; no se contabilizan como pendientes.

### 2.3 Alcance y límites

Se recorrió el repositorio excluyendo `.git`, el repositorio bare `reprodisseny.git`, `node_modules`, `.nuxt`, `.output`, `dist`, `coverage`, cachés y artefactos equivalentes. Se incluyeron ficheros rastreados y locales ignorados. También se consultó el historial cuando la ausencia actual podía ocultar decisiones o riesgos.

No se leyó ni mostró ningún `.env`. No se escribieron datos en CMS/SharePoint, no se enviaron formularios reales, no se desplegó y no se modificó código funcional.

Las comprobaciones públicas se hicieron entre las 20:06 y las 20:08 CEST del 2026-10-18. Son observaciones puntuales, no sustituyen Search Console, logs del CDN ni monitorización.

## 3. Inventario documental: volumen y distribución

El inventario detallado está en [`seo-md-inventory-2026-10-18.csv`](./seo-md-inventory-2026-10-18.csv).

### 3.1 Cobertura

- **37 elementos preexistentes:** 29 Markdown y 8 documentos/artefactos relacionados.
- **27 rastreados por Git:** 26 Markdown y un `README.txt` de assets.
- **10 locales ignorados:** tres informes Markdown, un XLSX, un JSON y cinco logs/listados.
- Los dos entregables de esta auditoría no se incluyen en el corpus para evitar una cuenta circular.
- Se excluyeron como documentación `cms/catalog.json`, `cms/routes.json` y `cms/search-index.json`: son datos activos de publicación, no informes para limpiar.

### 3.2 Distribución por área principal

| Área | Elementos |
| --- | ---: |
| SEO técnico e indexación | 1 |
| Search Console y Semrush | 1 |
| Arquitectura web y categorías | 2 |
| Productos, contenidos y palabras clave | 5 |
| Redirecciones, URLs antiguas y 404 | 4 |
| Rendimiento, CWV y móvil | 1 |
| Datos estructurados y SEO local | 0 documentos dedicados |
| Analítica, conversiones, formularios y CRO | 1 |
| CMS, SharePoint y sincronización | 9 |
| Desarrollo, mantenimiento y documentación técnica | 12 |
| CRM u otros proyectos fuera del SEO comercial | 1 |

La ausencia de un documento dedicado no implica ausencia de implementación: schema, SEO local, consentimiento y medición están principalmente en código y pruebas.

### 3.3 Documentación interna frente a contenido activo

Los Markdown bajo `content/_docs/` **no son contenido comercial activo**:

- `content.config.ts` limita sus colecciones a `cms/categorias/**/*` y `cms/productos/**/*` ([`content.config.ts:25`](../../content.config.ts#L25)).
- El servicio que entrega el catálogo importa directamente `cms/catalog.json` ([`server/services/cms/catalog.service.ts:1`](../../server/services/cms/catalog.service.ts#L1)).
- La compilación de esta auditoría procesó tres colecciones de Nuxt Content y cero ficheros.
- La búsqueda de rutas y consumidores no encontró referencias de publicación a `content/_docs/` ni a `plantillas/`.

Los campos Markdown incrustados dentro de `cms/catalog.json` sí son activos y se renderizan. El auditor de secciones revisó 666 secciones de entrada, reconoció 576 tabs publicables y terminó con **0 problemas fuera de contrato**. Por tanto:

> No se deben borrar ni editar como parte de la limpieza documental `cms/catalog.json`, `cms/routes.json`, `cms/search-index.json`, los datos de `server/data/`, el sincronizador ni el contenido de SharePoint.

El historial contiene cientos de páginas Markdown comerciales retiradas durante la migración. Su ausencia actual no es evidencia de pérdida y no deben restaurarse sin una decisión explícita de arquitectura.

## 4. Diagnóstico de vigencia documental

### 4.1 Estados

| Estado | Cantidad | Diagnóstico |
| --- | ---: | --- |
| Vigente | 0 | No existía un documento maestro suficiente antes de esta auditoría. |
| Histórico útil | 7 | Auditorías o planes que conservan evidencia fechada, no estado actual. |
| Sustituido por otro documento/sistema | 1 | Guía Markdown desplazada por CMS/SharePoint. |
| Duplicado | 5 | Copias exactas, solapamientos o doble salida de una misma ejecución. |
| Obsoleto | 18 | Describe componentes, rutas, scripts o fuentes retiradas. |
| Contradictorio | 4 | Indica modelos incompatibles con la decisión técnica actual. |
| Pendiente de verificación | 1 | Estudio de competencia sin datos reproducibles actuales. |
| Fuera del alcance SEO | 1 | Plan mixto de CRM/operaciones. |

### 4.2 Acciones propuestas

| Acción | Cantidad | Condición |
| --- | ---: | --- |
| ACTUALIZAR | 2 | README raíz y referencia de scripts. |
| FUSIONAR | 7 | Extraer lo útil al README o a este maestro antes de retirar el original. |
| ARCHIVAR | 8 | Mantener una zona histórica fechada y no operativa. |
| CANDIDATO A ELIMINACIÓN | 19 | Solo después de aprobación y de ajustar generadores cuando corresponda. |
| REVISIÓN HUMANA | 1 | Estudio de competencia que requiere fuentes externas. |

“Candidato” no autoriza el borrado. El CSV registra sustituto, referencias, justificación, riesgo implícito y confianza por cada fichero.

## 5. Contradicciones y duplicidades

### 5.1 Contradicciones materiales

1. **Markdown frente a CMS.** `content/_docs/estructura-md.md`, `plantillas/README.md` y las dos plantillas presentan archivos Markdown como fuente del catálogo. La aplicación publica el snapshot sincronizado de SharePoint en `cms/catalog.json`.
2. **Schema comercial antiguo frente a prudencia actual.** La plantilla de producto propone `Product`, `Offer`, precios y ratings. El builder actual declara expresamente que no genera esos tipos ni propiedades cuando no hay precio fijo ([`utils/seo/buildProductPageSchema.ts:116`](../../utils/seo/buildProductPageSchema.ts#L116)). Esta decisión debe preservarse.
3. **Checklist antigua frente a implementación.** `content/_docs/index.md` y `tareas.md` mantienen como pendientes sitemap, robots, canonicals, schema y enlaces internos que ya existen y tienen pruebas.
4. **Informe de redirects frente a validación actual.** El informe local habla de 357 redirects y typecheck código 2; el 2026-10-18 hay 362 redirects y typecheck código 0. El texto antiguo está codificado a mano en [`scripts/validate-seo-http.ts:418`](../../scripts/validate-seo-http.ts#L418).
5. **Calendarios de agosto frente a producción actual.** `SEO_LEGACY_200_AUDIT.md` observó el subdominio con página 2025 y estado 200. Hoy redirige a la campaña 2027, aunque con dos saltos.
6. **Scripts documentados frente a scripts inexistentes.** `package.json` conserva `validate-md` y `validate-md-seo`, pero `scripts/validate-md-structure.js` y `scripts/validate-md-seo.js` no existen ([`package.json:17`](../../package.json#L17)). Por ello `validate:all` está roto aunque la cadena moderna `validate:seo` sí funciona.
7. **`public/_robots.txt` frente al robots real.** Ese fichero con guion bajo no es el `robots.txt` servido. Nuxt genera el robots activo desde [`nuxt.config.ts:88`](../../nuxt.config.ts#L88). Mantener ambos sin explicación favorece diagnósticos falsos.

### 5.2 Duplicados confirmados

- `content/_docs/index.md` y `content/_docs/tareas.md` son idénticos byte a byte.
- `content/_docs/estructura-md.md` y `plantillas/README.md` no son idénticos, pero explican el mismo modelo retirado.
- `reports/cms-sync/cms-sync-report.md` y `.json` representan la misma ejecución; el generador produce ambos ([`scripts/sync-cms-core.ts:785`](../../scripts/sync-cms-core.ts#L785)).
- `seo-audit/redirects_404_revision_manual.md` repite el dato “0 pendientes” ya incluido en `redirects_404_resultado.md`.
- Los tres listados de `logs/` apuntan al catálogo Markdown antiguo; dos son fotos únicas y otro lo genera un script también obsoleto.

## 6. Estado real del SEO implementado

### 6.1 Indexación, rastreo, canonicals y sitemap

**Implementado y verificado localmente**

- El sitio solo se declara indexable en producción y con origen canónico ([`nuxt.config.ts:62`](../../nuxt.config.ts#L62)).
- Robots excluye administración, API, panel y agradecimiento, y declara sitemap ([`nuxt.config.ts:71`](../../nuxt.config.ts#L71)).
- El sitemap toma catálogo y rutas, excluye entradas ocultas, no publicadas o `noindex`, elimina duplicados y añade imágenes ([`server/api/__sitemap__/urls.ts:123`](../../server/api/__sitemap__/urls.ts#L123), [`server/api/__sitemap__/urls.ts:222`](../../server/api/__sitemap__/urls.ts#L222)).
- Producto y categoría generan canonical desde el DTO y JSON-LD centralizado ([`pages/productos/[...slug].vue:275`](../../pages/productos/%5B...slug%5D.vue#L275), [`pages/categorias/[...slug].vue:406`](../../pages/categorias/%5B...slug%5D.vue#L406)).
- Filtros no canónicos de catálogo y respuestas 404/410 reciben `noindex, follow` por cabecera ([`server/plugins/error-robots.ts:8`](../../server/plugins/error-robots.ts#L8)).
- La prueba de catálogo confirma que cada producto publicado enlaza desde su categoría primaria y vuelve a ella ([`tests/catalog-indexability.test.ts:79`](../../tests/catalog-indexability.test.ts#L79)).

**Observado en producción el 2026-10-18**

- [robots.txt](https://reprodisseny.com/robots.txt) respondió 200 con el mismo contenido que la compilación local.
- [sitemap.xml](https://reprodisseny.com/sitemap.xml) respondió 200, contenía 142 `<loc>` y coincidía con el local salvo el timestamp de generación.
- Home, adhesivos, gran formato, expositores, eventos, hostelería, lanyards, acreditaciones, photocall y etiquetas en bobina respondieron 200, con una canonical absoluta, un H1 y directiva indexable.
- `/productos?buscar=vinilo` respondió 200 con canonical `/productos` y `noindex, follow`; `/gracias` respondió 200 y `noindex, nofollow`.

**No demostrado**

- Que Google haya rastreado o indexado correctamente todas las URLs.
- Que no existan “Descubierta/rastreada, actualmente sin indexar”, soft 404 o canonical elegida por Google distinta.
- Estado actual de cobertura, páginas huérfanas vistas por Google, crawl budget o sitemaps procesados.

Todo ello requiere exportación actual de Google Search Console y, cuando proceda, inspección de URL.

### 6.2 Subdominios

| Host | Evidencia 2026-10-18 | Estado |
| --- | --- | --- |
| `reprodisseny.com` | robots y sitemap 200; muestra de páginas coherente | Implementación principal verificada en muestra. |
| `blog.reprodisseny.com` | certificado no válido para el host; con verificación TLS desactivada, robots devuelve `Disallow: /` | **P0 externo.** Confirmar si el blog debe posicionar, redirigir o retirarse. |
| `calendarios.reprodisseny.com` | Netlify 301 → producto antiguo → Vercel 301 → landing 2027 200 indexable | El noindex/200 antiguo ya no se observa; queda cadena de redirección externa. |

`LEGACY_HOSTS` incluye blog y calendarios ([`shared/seo/legacyRedirects.ts:3`](../../shared/seo/legacyRedirects.ts#L3)), pero esa lógica solo actúa si DNS/proxy lleva la petición a esta aplicación.

### 6.3 Redirecciones y URLs antiguas

El estado local es consistente:

- **362** redirects efectivos.
- **31** familias 410: 21 paths exactos y 10 prefijos.
- **3** 404 explícitos.
- **2** excepciones semánticas de `printestimate` para vinilo.
- 0 errores y 0 warnings en `npm run validate:seo-redirects`.

El XLSX histórico contiene 122 filas y, antes de la revisión final, las repartía en 106 casos 301, 10 casos 410, 1 caso 404 y 5 por revisar. El informe posterior cerró esas cinco decisiones y quedó en 106/12/4/0. No es una discrepancia que deba “corregirse” en el Excel: representa dos momentos del mismo proceso. Sí debe evitarse presentar cualquiera de esos recuentos como inventario global actual, porque el código incorpora más reglas que aquel lote de Search Console.

El middleware normaliza hosts legacy, consultas conocidas y 410 ([`server/middleware/legacy-notfound-redirect.ts:20`](../../server/middleware/legacy-notfound-redirect.ts#L20)). No se encontraron enlaces activos a `/product/` o `/category/` en plantillas/código comercial ni valores absolutos antiguos en el catálogo. Las coincidencias restantes pertenecen a reglas, validadores y pruebas.

La muestra pública confirmó:

- `/product/lanyards-personalizados-presupuesto` → 301 directo a `/productos/lanyards-eventos-barcelona`.
- `/category/imprimir-etiquetas-adhesivas-personalizadas` → 301 directo a `/categorias/adhesivos-personalizados`.
- `/product/plantilla-tarjeta-3` → 410 y `X-Robots-Tag: noindex, follow`.

Pendientes concretos:

- Repetir el lote HTTP completo de 122 URLs cuando se corrija el generador del informe.
- Decidir con negocio las dos excepciones de vinilo en [`shared/seo/legacyRedirects.ts:19`](../../shared/seo/legacyRedirects.ts#L19).
- Confirmar si `/page/rosa-sant-jordi` debe seguir como 404 explícito ([`shared/seo/legacyRedirects.ts:82`](../../shared/seo/legacyRedirects.ts#L82)).
- Eliminar el primer salto del subdominio de calendarios en Netlify.

No hay evidencia para cambiar la arquitectura canónica `/productos/` y `/categorias/`.

### 6.4 Arquitectura, contenidos y palabras clave

El snapshot `cms/catalog.json`, generado el 2026-10-14 16:26:39Z, contiene **12 categorías y 118 productos**, todos publicados. Para las 130 entradas:

- no falta `metaTitle`, `metaDescription`, canonical, imagen, secciones ni FAQ;
- no hay títulos, descripciones, canonicals o paths duplicados exactos;
- cada página objetivo solicitada tiene una URL propia o una categoría coherente;
- el informe de sincronización registra 0 errores y 28 avisos de longitud.

Páginas y clusters comprobados:

| Intención | Implementación actual | Verificación |
| --- | --- | --- |
| Imprenta Barcelona / impresión digital | Home con title, H1 y texto visible orientado a empresa ([`pages/index.vue:89`](../../pages/index.vue#L89)); producción 200 | Implementada; rendimiento orgánico no conocido. |
| Adhesivos / etiquetas | categoría canónica y productos específicos; commit HEAD `2aa7538` | Implementada y visible; validar consultas/canibalización en GSC. |
| Lanyards / acreditaciones | productos específicos, 7 secciones y 7 FAQ; commit `03924ee` | Implementada y visible. |
| Expositores / photocall | categoría comercial, ItemList y fichas relacionadas; commits `12733ff` y `fdec7db` | Implementada; medir captación. |
| Eventos | categoría y catálogo enriquecido; commit `d386149` | Implementada; medir solapamiento con acreditaciones/lanyards/photocall. |
| Gran formato | categoría, dos subcategorías y fichas | Implementada; no crear otra landing sin evidencia de intención distinta. |
| Hostelería | categoría y productos como cartas, posavasos, manteles y portacuentas | Implementada; capacidades y acabados deben validarse con producción antes de editar. |

Los 28 avisos del sync corresponden a límites editoriales recomendados —12 títulos largos, 4 cortos, 10 descripciones largas y 2 cortas—, no a errores técnicos ni a una razón suficiente para reescribir. Se deben cruzar con impresiones, CTR, posición, intención y valor comercial.

No se puede afirmar canibalización ni oportunidad cuantificada a partir de `content/_docs/seo/analisis-competencia.md`: carece de fecha/fuentes suficientes y no contiene datos actuales de Search Console o Semrush.

### 6.5 Datos estructurados y SEO local

- La home publica una identidad única `LocalBusiness`, `WebSite` y `WebPage` ([`utils/seo/siteIdentity.ts:1`](../../utils/seo/siteIdentity.ts#L1)).
- Categorías publican `CollectionPage`, `ItemList`, entidades `Service` y breadcrumbs ([`utils/seo/buildCategoryPageSchema.ts:283`](../../utils/seo/buildCategoryPageSchema.ts#L283)).
- Productos publican `WebPage`, imagen y breadcrumbs, sin inventar precio, oferta, disponibilidad ni rating ([`utils/seo/buildProductPageSchema.ts:116`](../../utils/seo/buildProductPageSchema.ts#L116)).
- La muestra pública confirmó esos tipos. Las FAQ son visibles, pero el builder vigente no publica `FAQPage`; no se propone añadirlo sin un objetivo y validación específicos.

Debe confirmarse con negocio que razón social, NIF, fundación, dirección, horarios, idiomas, redes y demás hechos de [`utils/seo/siteIdentity.ts:10`](../../utils/seo/siteIdentity.ts#L10) siguen siendo correctos. No se ha inventado ni alterado ninguno.

### 6.6 Rendimiento y experiencia móvil

Implementado:

- `features.inlineStyles: false` mantiene fuera del HTML los estilos globales ([`nuxt.config.ts:52`](../../nuxt.config.ts#L52)); `SSR_PAYLOAD_AUDIT.md` documenta una reducción local histórica de aproximadamente 60–76 %, no una mejora de CWV.
- Home usa AVIF/WebP, `srcset`, `sizes`, dimensiones y prioridad explícita para el banner ([`pages/index.vue:9`](../../pages/index.vue#L9)).
- Héroes de categoría y producto declaran dimensiones y prioridad para la imagen principal.
- GTM se carga en primera interacción o tras 7 segundos ([`utils/googleConsent.ts:59`](../../utils/googleConsent.ts#L59)).
- Consent Mode parte de almacenamiento analítico/publicitario denegado y CookieConsent sincroniza categorías ([`utils/googleConsent.ts:21`](../../utils/googleConsent.ts#L21), [`plugins/cookie-consent.client.ts:16`](../../plugins/cookie-consent.client.ts#L16)).

No verificado:

- LCP, INP y CLS actuales por plantilla/dispositivo.
- Impacto de CDN, scripts de terceros, consentimiento o imágenes en usuarios reales.
- Puntuaciones PageSpeed. No se incluyen porque no se midieron.

La compilación local pasó. Los avisos fueron de `caniuse-lite` desactualizado, anotaciones de dependencias y la advertencia de robots sobre `/api/**`; no se detectó fallo de build. El tamaño de chunks de una compilación no debe convertirse en diagnóstico CWV sin perfilado.

### 6.7 Formularios, conversiones y medición

La implementación actual solo lanza `generate_lead` tras una respuesta de solicitud creada, evita duplicados y bloquea envíos simultáneos ([`utils/tracking/leadForm.ts:65`](../../utils/tracking/leadForm.ts#L65)). Los eventos `form_start`, `form_validation_error` y `generate_lead` usan una lista cerrada sin PII ([`composables/useTracking.ts:32`](../../composables/useTracking.ts#L32), [`composables/useTracking.ts:171`](../../composables/useTracking.ts#L171)). Las pruebas unitarias de formularios y atribución pasaron.

Sin embargo:

- El arreglo del falso éxito del formulario genérico solo está en `origin/main`, no en el HEAD local.
- `origin/fix/quote-form-calendars` conserva un commit exclusivo con 331 inserciones, pruebas de navegador y cambios de backend; debe compararse con la consolidación ya integrada antes de cerrarlo.
- No se ejecutó un lead real ni se verificó el evento en GA4/Google Ads. Hacerlo requiere entorno controlado, acceso externo y un procedimiento que no contamine CRM.
- La existencia de código o de una rama no demuestra que la conversión esté desplegada y atribuida correctamente.

## 7. Validaciones ejecutadas

| Comando/comprobación | Resultado |
| --- | --- |
| `npm run validate:seo-routes` | PASS: 130 rutas de catálogo y 12 categorías canónicas. |
| `npm run validate:seo-redirects` | PASS: 362 redirects, 31 reglas 410, 3 404, 2 excepciones, 0 errores/warnings. El primer intento falló por el socket IPC del sandbox; la repetición autorizada fuera del sandbox pasó. |
| `npm run audit:content-sections` | PASS: 666 secciones, 576 tabs publicables, 0 problemas no contractuales. |
| `npm run test:content-sections` | PASS: 25/25. |
| `npm test` | PASS: 247 pruebas, 246 aprobadas, 0 fallidas y 1 omitida. |
| `npm run typecheck` | PASS, código 0. |
| `npm run build` | PASS. |
| Servidor de build local | Home, robots y sitemap 200; robots esperado; sitemap 142 URLs. |
| Muestra HTTP pública | Estados, canonicals, H1, robots y JSON-LD descritos en la sección 6. |

La única prueba omitida cubre interacción de tabs en el detalle de categoría; por tanto, esa interacción no queda verificada por la suite completa.

No se ejecutó `npm run validate:seo-http` porque sobrescribe dos informes ignorados y la auditoría autoriza únicamente dos archivos nuevos. Tampoco se ejecutó `validate:all`: sus dos scripts Markdown no existen.

## 8. Matriz consolidada de tareas

Las prioridades combinan impacto SEO, impacto comercial, urgencia, evidencia, riesgo, esfuerzo y dependencias. “Verificado en código” no significa desplegado salvo que la evidencia indique producción.

| ID | Tarea normalizada | Documento origen | Estado real | Evidencia | Prioridad | Dependencia |
| --- | --- | --- | --- | --- | --- | --- |
| SEC-01 | Revocar/rotar la credencial histórica y revisar uso | Hallazgo nuevo en historial | BLOQUEADO POR DATOS EXTERNOS | `content/docs/memoria.md` antes de `63f3da3`; valor omitido | P0 | Propietario SendGrid y secretos de despliegue |
| GIT-01 | Identificar SHA desplegado y alinear la revisión con `origin/main` | Hallazgo Git | PENDIENTE | HEAD `2aa7538`, origin `4ba8309`, 0/2 | P0 | Acceso Vercel y flujo Git aprobado |
| FORM-01 | Evitar falso éxito del formulario general | Planes de formularios + origin/main | IMPLEMENTADO, PENDIENTE DE VALIDACIÓN EN PRODUCCIÓN | `81fb91f`; no está en HEAD local | P0 | GIT-01 y smoke test controlado |
| IDX-01 | Resolver TLS y política de rastreo del blog | `SEO_LEGACY_200_AUDIT.md` + hallazgo público | PENDIENTE | certificado no coincidente; robots `Disallow: /` | P0 | Decisión: posicionar, redirigir o retirar; acceso hosting/DNS |
| IDX-02 | Obtener cobertura e inspección actuales de GSC | planes SEO antiguos | BLOQUEADO POR DATOS EXTERNOS | No hay exportación actual en el repo | P0 | Acceso Search Console |
| IDX-03 | Mantener robots/sitemap/canonical/noindex principales | checklists antiguas | IMPLEMENTADO, PENDIENTE DE VALIDACIÓN EN PRODUCCIÓN | código, tests y muestra pública; no cobertura Google | P0 | IDX-02 |
| RED-01 | Mantener mapa 301/410/404 legacy | auditorías de redirects | IMPLEMENTADO Y VERIFICADO EN CÓDIGO | validador: 362/31/3/2, sin errores | P1 | No cambiar destinos sin evidencia |
| RED-02 | Revalidar las 122 URLs contra producción | XLSX e informe agosto | IMPLEMENTADO, PENDIENTE DE VALIDACIÓN EN PRODUCCIÓN | muestra pública correcta; lote completo no repetido | P1 | Corregir RED-04 y disponer de servidor/producción |
| RED-03 | Quitar la cadena del subdominio calendarios | `SEO_LEGACY_200_AUDIT.md` | PARCIALMENTE IMPLEMENTADO | 301 Netlify → producto antiguo → 301 Vercel → landing 2027 | P1 | Acceso Netlify/DNS |
| RED-04 | Hacer dinámico el informe `validate-seo-http` | informes locales | PENDIENTE | texto fijo en `scripts/validate-seo-http.ts:418-421` | P1 | Ninguna; cambio técnico posterior a aprobación |
| RED-05 | Resolver dos excepciones de vinilo y Rosa Sant Jordi | auditoría redirects | PENDIENTE | `shared/seo/legacyRedirects.ts:19-29,82-87` | P2 | Confirmación de equivalencia comercial |
| ARC-01 | Arquitectura `/productos/` y `/categorias/` | checklists antiguas | IMPLEMENTADO Y VERIFICADO EN CÓDIGO | rutas, sitemap, canonical, tests de aliases y categorías | P1 | Preservar URLs |
| LINK-01 | Enlazado de producto desde categoría y retorno | planes de contenido | IMPLEMENTADO Y VERIFICADO EN CÓDIGO | `tests/catalog-indexability.test.ts:79`; suite pasa | P1 | Revalidar cuando cambie el CMS |
| CONT-01 | Validar cobertura de metadatos/contenido CMS | informe CMS | IMPLEMENTADO Y VERIFICADO EN CÓDIGO | 130/130 con metadatos, secciones, FAQ e imagen; sin duplicados exactos | P1 | Mantener sync estricto |
| CONT-02 | Priorizar 28 avisos de longitud por impacto | informe CMS | PENDIENTE | 28 warnings, 0 errores | P2 | GSC/Semrush y revisión editorial |
| CONT-03 | Mapear consultas y canibalización de clusters prioritarios | análisis competencia, home y planes SEO | BLOQUEADO POR DATOS EXTERNOS | páginas existen; no hay consultas/volúmenes actuales | P1 | GSC, Semrush y SERP fechada |
| CONT-04 | Validar afirmaciones técnicas/comerciales antes de editar | plantillas y catálogo | BLOQUEADO POR DATOS EXTERNOS | acabados, plazos y capacidades proceden del CMS | P1 | Producción/comercial |
| CONT-05 | Crear nuevas páginas para variantes | recomendaciones antiguas genéricas | OBSOLETO O YA NO NECESARIO | ya hay arquitectura rica; falta evidencia de intención separada | P3 | Solo reabrir con CONT-03 |
| SCHEMA-01 | Schema de home, categoría y ficha sin afirmaciones falsas | plantillas y auditorías schema | IMPLEMENTADO Y VERIFICADO EN CÓDIGO | builders, tests y muestra pública | P1 | Confirmar datos locales de negocio |
| SCHEMA-02 | Añadir Product/Offer/rating a todas las fichas | plantilla antigua | OBSOLETO O YA NO NECESARIO | decisión explícita de no declarar precio/oferta/rating | P3 | Reabrir solo con datos comerciales completos |
| PERF-01 | Extracción de CSS SSR | `SSR_PAYLOAD_AUDIT.md` | IMPLEMENTADO Y VERIFICADO EN CÓDIGO | `inlineStyles:false`, build OK | P2 | Medición de campo para impacto real |
| PERF-02 | Imágenes responsive y prioridad LCP | tareas de rendimiento/commits | IMPLEMENTADO, PENDIENTE DE VALIDACIÓN EN PRODUCCIÓN | AVIF/WebP/srcset/dimensiones presentes | P2 | CrUX/PageSpeed y prueba móvil |
| PERF-03 | GTM diferido, consentimiento y Consent Mode | planes rendimiento/consentimiento | IMPLEMENTADO, PENDIENTE DE VALIDACIÓN EN PRODUCCIÓN | código y tests; no Tag Assistant/GA4 real | P1 | CMP, GTM, GA4 y Ads |
| FORM-02 | Eventos de lead sin PII y solo tras creación | planes CRO/formularios | IMPLEMENTADO Y VERIFICADO EN CÓDIGO | `leadForm.ts`, `useTracking.ts`, suite pasa | P1 | Validación externa de recepción |
| FORM-03 | Reconciliar rama de calendarios/formularios | hallazgo Git | NO DETERMINABLE | `53fb7c5`, 15 ficheros, rama 11 commits detrás | P1 | Comparación funcional con `4ba8309` |
| FORM-04 | Smoke test controlado de lead y GA4/Ads | planes de conversión | BLOQUEADO POR DATOS EXTERNOS | no se envió lead real en esta auditoría | P1 | Entorno/lead de prueba y accesos analíticos |
| DOC-01 | Crear una fuente maestra y un inventario | todos los documentos | IMPLEMENTADO Y VERIFICADO EN CÓDIGO | estos dos entregables | P1 | Revisión y aprobación humana |
| DOC-02 | Archivar/fusionar/eliminar candidatos | todos los documentos | PENDIENTE | 8/7/19 propuestas; no se movió nada | P3 | Aprobación y ajuste de generadores |
| DEV-01 | Reparar/retirar validadores Markdown rotos | documentación de scripts | PENDIENTE | `package.json:17-19,31`; archivos ausentes | P2 | Definir si queda algún flujo Markdown legítimo |
| DEV-02 | Cubrir la interacción de tabs omitida | suite | PARCIALMENTE IMPLEMENTADO | 1 prueba skipped de 247 | P3 | Estabilizar entorno de interacción |
| BRANCH-01 | Cerrar ramas SEO WIP ya sustituidas | hallazgo Git | PENDIENTE | divergencias de la sección 2.2 | P3 | Revisar commits exclusivos y política de conservación |

## 9. Incidencias técnicas pendientes

### P0 — críticas

- Credencial histórica potencialmente comprometida: rotación y auditoría de uso.
- Blog con TLS incorrecto y bloqueo total de robots, salvo que su retirada sea una decisión empresarial explícita.
- Falta de trazabilidad del SHA desplegado y del arreglo de falso éxito del formulario.
- Falta de cobertura actual de Search Console para descartar pérdida de indexación.

### P1 — impacto alto

- Cadena de dos 301 desde calendarios.
- Validación HTTP completa del lote legacy y corrección de su generador de informes.
- Reconciliación de la rama de formularios/calendarios.
- Verificación end-to-end de leads y eventos en GA4/Ads.
- Confirmación de datos de LocalBusiness y de afirmaciones de producción.
- Investigación actual de consultas y canibalización antes de editar páginas.

### P2/P3 — mantenimiento

- Decidir 28 avisos de metadatos por datos, no por contador.
- Obtener CWV móviles de campo y perfilar plantillas concretas.
- Reparar aliases de validación retirados, el verificador Markdown antiguo y el informe HTTP codificado.
- Resolver la prueba omitida y limpiar ramas/documentos una vez aprobada esta auditoría.

## 10. Oportunidades SEO y comerciales priorizadas

### Correcciones técnicas

1. Recuperar o cerrar correctamente el subdominio del blog.
2. Hacer directa la redirección de calendarios a la landing vigente.
3. Garantizar que la versión desplegada incluye la consolidación de formularios y medir un lead completo.
4. Mantener el mapa legacy actual y revalidarlo con una herramienta que no incruste resultados viejos.
5. Medir CWV por home, categoría, producto y landing; optimizar solo el cuello de botella observado.

### Decisiones editoriales

1. Mapear consultas de “imprenta Barcelona”, lanyards, acreditaciones, expositores/photocall, eventos, etiquetas, gran formato y hostelería a las URLs ya existentes.
2. Usar impresiones/posición/CTR/conversión para escoger qué avisos de metadatos merecen reescritura.
3. Revisar solapamiento real entre categoría Eventos y fichas de lanyards, acreditaciones y photocall; no dividir ni fusionar sin datos.
4. Validar con producción todos los materiales, acabados, plazos, instalación y logística antes de reforzar copy.

### Tareas con servicios externos

- Search Console: cobertura, sitemaps, inspección, consultas y errores 404.
- Semrush/SERP: demanda, competidores y solapamiento actuales.
- GA4/Ads/GTM: eventos, consentimiento, atribución y conversión.
- CrUX/PageSpeed: métricas móviles de campo/laboratorio.
- Vercel, Netlify, DNS y hosting del blog: SHA, redirecciones, certificado y robots.
- SharePoint/producción: exactitud y vigencia del contenido.

## 11. Propuesta de archivo y limpieza documental

### 11.1 Estructura sostenible

```text
README.md                              # Operación técnica breve y vigente
docs/
  audits/
    seo-md-audit-2026-10-18.md         # Fuente maestra actual
    seo-md-inventory-2026-10-18.csv    # Registro por documento
  archive/
    seo/                               # Auditorías fechadas, solo lectura
```

No se propone crear un Markdown por tema. El README debe contener únicamente instalación, arquitectura de datos, comandos válidos, despliegue y enlaces al maestro. Las ejecuciones de CMS/redirects deberían ser artefactos fechados de CI o temporales, no una colección manual en crecimiento.

### 11.2 Qué archivar

Ocho elementos: las auditorías legacy/SSR, planes diarios que conservan contexto, informe CMS fechado, XLSX fuente y resultado principal de redirects. Deben identificarse como históricos y no aparecer como backlog vigente.

### 11.3 Qué fusionar

Siete elementos: guías de estructura, TODO duplicado, buscador, formularios, layouts y README de plantillas. Solo se traslada información confirmada; el resto no se perpetúa.

### 11.4 Candidatos a eliminación

Diecinueve elementos, detallados en el CSV. Riesgos y condiciones:

- Los tres Markdown de prueba y las plantillas no son fuentes activas; riesgo bajo tras confirmar con contenidos que no se usan fuera de Git.
- Los READMEs técnicos antiguos no tienen referencias; riesgo bajo.
- Los informes/logs generados reaparecerán mientras sus scripts los escriban. Primero se debe cambiar el generador o su política de retención.
- `reports/cms-sync/cms-sync-report.json` podría ser consumido fuera del repositorio; al no poder verificarlo, su eliminación requiere revisión humana pese a no tener lectores locales.
- El histórico Git conserva todo lo rastreado; los ignorados locales no tienen esa recuperación garantizada y deben respaldarse si se decide que son evidencia legal/operativa.

No se ha eliminado, movido ni renombrado nada.

## 12. Plan realista de cuatro semanas

### Semana 1 — riesgos y verdad de producción

- Revocar/rotar el secreto histórico y revisar logs/uso.
- Decidir la función del blog; corregir TLS y robots o implantar redirección de retirada.
- Obtener el SHA de Vercel y reconciliar HEAD local, `origin/main` y la rama de formularios.
- Exportar GSC de 16 meses: páginas, consultas, cobertura, sitemaps y 404; exportar Semrush con fecha.
- Cambiar en Netlify el destino de calendarios a la landing 2027 directa.

**Salida:** registro de riesgos cerrado, producción identificada y dataset externo fechado.

### Semana 2 — rastreo y migraciones

- Corregir el texto fijo de `validate-seo-http` y ejecutar el lote completo de 122 URLs.
- Revisar GSC por 404/soft 404, canonical elegida, rastreada no indexada y descubierta no indexada.
- Resolver las dos equivalencias de vinilo y Rosa Sant Jordi con negocio.
- Confirmar sitemap/robots/subdominios después de los cambios externos.

**Salida:** mapa de URLs validado en producción, sin cadenas evitables ni decisiones abiertas críticas.

### Semana 3 — contenido y conversión

- Construir mapa consulta → URL → intención → lead para los clusters prioritarios.
- Seleccionar, no reescribir masivamente, los metadatos con mayor oportunidad.
- Validar afirmaciones técnicas con producción/comercial.
- Ejecutar un lead de prueba controlado por cada formulario crítico y verificar SharePoint/CRM, dataLayer, GA4 y Ads sin PII.

**Salida:** backlog editorial con evidencia y embudo de lead verificado.

### Semana 4 — rendimiento y mantenimiento

- Medir CWV móvil por plantilla y perfilar LCP/INP/CLS y terceros.
- Aplicar solo mejoras respaldadas por la medición y volver a medir.
- Reparar comandos de validación, cerrar ramas sustituidas y resolver la prueba omitida.
- Tras aprobación, ejecutar la limpieza documental 8/7/19 y actualizar el README.

**Salida:** baseline de rendimiento, validación reproducible y documentación sostenible.

## 13. Cinco acciones prioritarias para comenzar

1. **Rotar la credencial histórica y auditar su uso.** Es el riesgo más grave y no admite compensación SEO.
2. **Resolver el blog.** TLS inválido más `Disallow: /` puede anular su visibilidad y degradar confianza; primero hay que decidir si debe vivir, redirigir o cerrarse.
3. **Identificar el SHA desplegado y consolidar formularios.** Evita atribuir a producción un fix que solo está en `origin/main` y permite validar que una solicitud real nunca muestra éxito falso.
4. **Obtener GSC/Semrush/GA4 actuales y construir el mapa consulta → URL → lead.** Es la dependencia que convierte 130 páginas existentes en un backlog comercial ordenado, evitando nuevas páginas o reescrituras especulativas.
5. **Eliminar la cadena de calendarios y revalidar el lote legacy completo.** Es una corrección acotada, demostrable y previa a cualquier expansión de contenidos.

## 14. Qué no debemos tocar sin nueva evidencia

- La arquitectura canónica `/productos/` y `/categorias/`.
- Los canonicals, sitemap y `noindex` de filtros, búsqueda, agradecimiento y errores que ya pasan pruebas.
- La decisión de no declarar `Product`, `Offer`, precio o rating donde no existen datos fijos verificables.
- El catálogo activo `cms/*.json`, la sincronización SharePoint y los campos Markdown incrustados que sí renderiza la web.
- Las redirecciones 301/410 validadas; cambiar destinos requiere equivalencia semántica y datos de tráfico/enlaces.
- Consent Mode denegado por defecto, GTM diferido y eventos de lead sin PII.
- Las URLs y páginas comerciales actuales de los clusters prioritarios: primero medir; no duplicar intención.
- Los hechos comerciales y de fabricación sin confirmación del equipo de producción.

## 15. Riesgos, incertidumbres y verificaciones externas

| Incertidumbre | Por qué no se cierra aquí | Evidencia necesaria |
| --- | --- | --- |
| Indexación real y “rastreada no indexada” | El repo expresa intención, no el índice de Google | GSC e inspección de URL |
| Consultas, CTR, posición y canibalización | Los informes antiguos no son medición actual | GSC/Semrush/SERP fechada |
| Conversión real | Tests no prueban recepción externa ni atribución | Lead controlado, SharePoint/CRM, GA4/Ads |
| CWV móvil | Build y pesos locales no son experiencia de campo | CrUX/PageSpeed/RUM |
| Commit en producción | La respuesta HTTP no expone SHA | Vercel/deployment metadata |
| Blog y calendarios | Infraestructura externa al repositorio | DNS, TLS, Nginx/Netlify |
| Datos LocalBusiness y claims | Solo negocio puede certificar hechos | Revisión legal/comercial/producción |
| Uso externo de informes JSON/logs | No hay consumidores locales | Confirmación de CI/operaciones |
| Alcance del secreto histórico | No se consultaron cuentas externas | Rotación, auditoría del proveedor y secretos |

## 16. Referencia de entregables

- Informe maestro: `docs/audits/seo-md-audit-2026-10-18.md`
- Inventario CSV UTF-8: `docs/audits/seo-md-inventory-2026-10-18.csv`

Este informe no implementa ninguna mejora SEO. Las acciones quedan a la espera de revisión y aprobación.
