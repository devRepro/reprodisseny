# REF-PUBLICACIONES-SEO-01 — Readiness para producción

## Autorización e integración verificadas

El 17/11/2026 se recibe autorización expresa para actualizar exclusivamente los siete campos, fusionar si las comprobaciones son satisfactorias y publicar en Vercel. La actualización del CMS está ejecutada y verificada con eTag: solo se enviaron los siete campos aprobados y se comprobó que el resto del contenido permanecía intacto.

La integración afecta a **siete campos del registro Publicaciones, ID 7, lista WebCatetories**, sin cambios en productos, otras categorías o URLs. `CommercialJson` existe, es editable, de texto plano multilínea y sin anexado. El preflight posterior devuelve cero campos pendientes y `sync:cms:check` devuelve cero diferencias semánticas: 118 productos y 12 categorías, cero errores. Las 28 advertencias de longitud de metadatos son las mismas que antes de la operación y no corresponden a regresiones de esta entrega. No se regeneraron ni modificaron snapshots para incorporar cambios ajenos.

Se verificó la compatibilidad con el SHA publicado `b4f0686fb83caba064915875ebc801ba5176d172`: los endpoints publicados usan el snapshot incluido en su artefacto y el renderer anterior ignora las extensiones opcionales del JSON. La actualización de CMS no altera el artefacto actualmente servido durante la publicación coordinada.

Copia fresca de los siete campos y eTag anterior: `reports/publicaciones-seo/release/cms-seven-before-2026-11-17T14-08-01-272Z.json` (objeto `fields`). Resultado de escritura verificado: `release/cms-applied.json`; sincronización: `release/cms-sync-after.log`. Son artefactos locales, no se versionan credenciales ni copias de datos operativos.

Las futuras fotografías de catálogos abiertos/cerrados y de diferentes ediciones de revistas **no bloquean** la publicación: se usan recursos existentes y el inventario está en el informe principal.

## Procedimiento repetible de integración con CMS

El payload completo está versionado en [cms/publicaciones-editorial.fields.json](cms/publicaciones-editorial.fields.json). Contiene exclusivamente `Title`, `Description`, `MetaTitle`, `MetaDescription`, `ImageWidth`, `ImageHeight` y `CommercialJson`. Los seis primeros son valores escalares; `CommercialJson` es una cadena JSON completa, no HTML ni un objeto anidado de campos Graph.

1. Desde la raíz del repositorio, comprobar el payload y obtener una copia fresca del estado anterior:

   ```powershell
   node scripts/prepare-publicaciones-cms.mjs
   node scripts/prepare-publicaciones-cms.mjs --read-cms
   ```

   El script solo usa GET en Microsoft Graph. Genera `reports/publicaciones-seo/cms-preflight.json` con el eTag, la identidad exacta y el diff y, cuando hay diferencias pendientes, una copia inmutable `cms-before-<fecha>.json` con `beforeFields` para rollback. Los informes y las credenciales no se versionan. El script usa la configuración existente de `.env.imports` y no tiene modo de escritura remota.

2. **Solo con autorización para modificar producción**, actualizar esos siete campos del elemento 7 por la interfaz del CMS o enviar el archivo de payload como cuerpo de:

   ```http
   PATCH https://graph.microsoft.com/v1.0/sites/<site-id>/lists/<list-id>/items/7/fields
   Content-Type: application/json
   If-Match: <eTag recién leído>
   ```

   Usar los IDs de la lectura anterior, confirmar `CategorySlug=libros-revistas-catalogos` y `Path=/categorias/libros-revistas-catalogos`, y un token autorizado conservado en memoria. Un 412 requiere releer y revisar el cambio concurrente; no usar `If-Match: *`. Conservar el backup anterior. [Contrato oficial de actualización de campos](https://learn.microsoft.com/en-us/graph/api/listitem-update?view=graph-rest-1.0).

3. Verificar por lectura que el CMS conserva exactamente el contenido aprobado:

   ```powershell
   node scripts/prepare-publicaciones-cms.mjs --read-cms --require-integrated
   npm run sync:cms:check
   ```

   El primer comando debe terminar con cero campos pendientes. El segundo lee SharePoint/Azure y compara con el snapshot; no modifica el CMS ni el catálogo. Revisar que no proponga cambios ajenos a Publicaciones. Si detecta cambios de otros editores, no incluirlos en esta entrega.

4. Cuando haga falta regenerar los snapshots locales, ejecutar `npm run sync:cms:write` únicamente después del paso anterior y revisar el diff de `cms/catalog.json`, `cms/routes.json`, `cms/search-index.json` y `cms/product-details-media.json`. Este comando escribe archivos locales, no SharePoint. No ejecutar `generate` antes de integrar los siete campos: su sincronización podría recuperar el contenido anterior.

## Instrucciones de publicación

1. Revisar el [PR #7](https://github.com/devRepro/reprodisseny/pull/7) de `feat/publicaciones-editorial-seo` contra `main`. La autorización de publicación y la integración de CMS ya están verificadas; exigir CI en verde antes de fusionar. No habilitar auto-merge ni ampliar el alcance.
2. El repositorio tiene una integración Vercel verificada por el check del commit actual de `main`: proyecto `reprodisseny`, equipo `reprodevs-projects-838aa4b3`. En ese proyecto confirmar Production Branch y Build Command antes de fusionar; no cambiar estos ajustes como parte de esta entrega. La configuración privada del proyecto no está en el checkout. Una rama/PR puede generar un Preview automático; no equivale a una promoción a producción. [Funcionamiento oficial de la integración GitHub/Vercel](https://vercel.com/docs/git/vercel-for-github#updating-the-production-domain).
3. Construir el mismo SHA aprobado con Node 22, las dependencias del lockfile y el snapshot versionado. Para producción:

   ```powershell
   $env:NUXT_SITE_ENV='production'
   $env:NUXT_SITE_URL='https://reprodisseny.com'
   $env:NUXT_PUBLIC_SITE_URL='https://reprodisseny.com'
   npm run typecheck
   npm run validate:seo
   npm run build
   ```

   En Preview conservar el entorno de preview/noindex. Los formularios usan el transporte y las variables del proyecto existentes; no copiar `.env.imports` al despliegue.
4. La aplicación usa `cms/catalog.json`, la galería registrada y las rutas estáticas incluidos en el artefacto. No necesita `reports/`, fotos descargadas para auditoría, respuestas simuladas ni el helper de Windows en producción. Las interceptaciones de formularios solo pertenecen al verificador local. El helper arranca el mismo output Nitro en Windows y resuelve una particularidad de `import.meta`; no modifica el bundle ni los datos.
5. **Solo tras autorización**, fusionar el PR y dejar que el pipeline de la Production Branch publique, o promover el deployment del SHA aprobado desde Vercel según la configuración existente. No ejecutar ambos mecanismos sobre revisiones distintas. Guardar el SHA y el deployment ID anterior antes de iniciar.
6. Tras publicar, comprobar las tres URLs 200, sus H1/canonical/metadatos, enlaces de navegación, las siete fichas conservadas, sitemap, robots y los dos 301 antiguos de revistas. Validar el formulario con la instrumentación existente; una solicitud real requiere autorización y seguimiento comercial, no ejecutar el verificador interceptado contra producción.

## Rollback

1. Ante una regresión, volver al deployment de producción anterior desde el historial del proyecto Vercel. Si la publicación se automatiza por Git, preparar una reversión de los commits de esta entrega y aprobarla por el flujo habitual; no resetear ni forzar `main`.
2. Restaurar **solo** los siete valores de `fields` en la copia fresca de esta publicación (o `beforeFields` en las copias del preflight), sobre el mismo elemento 7 y con el eTag vigente. Conservar `CommercialJson` como columna; si estaba vacío, restaurar el valor vacío/null. No tocar contenidos técnicos, productos ni otras categorías.
3. Repetir el preflight de lectura y la sincronización en modo check para confirmar coherencia con el artefacto restaurado. Restaurar código y CMS como una misma operación; no sincronizar el contenido editorial nuevo sobre un artefacto antiguo.
4. Si las nuevas URLs ya han sido indexadas, decidir sus destinos permanentes antes de retirarlas. No introducir redirecciones genéricas o cadenas durante un rollback urgente.

Punto de retorno de código anterior a esta entrega: SHA `b4f0686fb83caba064915875ebc801ba5176d172`, deployment GitHub Production `7493712195`, Vercel `reprodisseny-b0o7m2rs3-reprodevs-projects-838aa4b3.vercel.app`. Si se usa Git para volver atrás tras una fusión por merge commit, revertir únicamente ese merge con su primer padre y dejar que el pipeline publique la reversión, sin reset ni force-push de `main`.
