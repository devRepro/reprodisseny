# Cierre técnico de la web comercial — 20/10/2026

## Alcance y criterio de cierre

Revisión ejecutada en `fix/seo-closure-20261020`, creada desde `origin/main` en
`edfbf2c`. No se ha hecho merge, push ni despliegue, ni se han modificado
servicios externos. No existe `AGENTS.md` en el repositorio.

Se reutilizó la auditoría del 18/10/2026 desde
`origin/docs/seo-audit-2026-10-18` mediante `git show`. No se repitió su
inventario documental ni el lote completo de 122 URLs porque seguían siendo
evidencia válida; se comprobaron únicamente los puntos de cierre y los cambios
realizados.

Los estados significan:

- **TERMINADO**: implementación local y prueba suficiente para el alcance indicado.
- **PENDIENTE**: queda trabajo verificable después de integrar o desplegar.
- **BLOQUEADO**: requiere acceso, autorización o cambios en un sistema externo.

## Resumen ejecutivo

El código queda preparado para revisión e integración. Las correcciones locales
P0/P1 están implementadas, la suite completa pasa, typecheck y build pasan, y el
árbol queda limpio. El proyecto no puede considerarse cerrado en producción por
cuatro dependencias externas: revocación/rotación documentada de SendGrid, TLS y
hosting del blog cancelado, validación real de leads/SharePoint y verificación de
GSC/GA4/Ads sobre el SHA que se despliegue.

## Tabla de cierre

| Etapa | Estado | Evidencia | Acción pendiente |
|---|---|---|---|
| Fase 0 — estado real y ramas | TERMINADO | `origin/main` coincide con el punto de partida; auditoría previa revisada; ramas comparadas por funcionalidad; árbol inicial limpio | Ninguna antes de revisión |
| Seguridad — árbol actual | TERMINADO | La credencial SendGrid no aparece en HEAD; `.env*` está ignorado; `tests/secret-exposure.test.ts` impide reintroducir su formato | Mantener el control en CI |
| Seguridad — credencial histórica | BLOQUEADO | La exposición sólo se encontró en historia local bajo `refs/original/refs/heads/navMb`; no es alcanzable desde HEAD ni ramas remotas locales. No existe prueba de revocación | Confirmar revocación/rotación y revisar actividad en SendGrid |
| Blog cancelado — implementación local | TERMINADO | URLs sin sustituto: 410 + `X-Robots-Tag`; robots permite rastreo; sitemap retirado; equivalencias explícitas conservan 301; pruebas y smoke local pasan | Integrar y desplegar la implementación |
| Blog cancelado — producción | BLOQUEADO | El 20/10 el certificado no coincide con el host; con TLS ignorado, `/robots.txt` responde 200 y `Disallow: /` | Corregir DNS/TLS/hosting y servir la política de retirada local |
| Formularios y conversiones — código | TERMINADO | Confirmación sólo tras respuesta creada ya estaba integrada; se conserva ahora `productType`/`needAdvice` del presupuesto genérico; validación, honeypot, errores, doble submit y eventos pasan pruebas | Ninguna corrección local adicional demostrada |
| Formularios — envío real y SharePoint | PENDIENTE | No se ha enviado un lead real ni se ha inspeccionado SharePoint | Smoke controlado después del despliegue, sin contaminar CRM |
| SEO técnico comercial — código | TERMINADO | 130 rutas y 12 categorías canónicas; 362 redirects, 31 reglas 410, 3 404 y 2 excepciones sin errores; build y sitemap local de 142 URLs | Preservar arquitectura y validar tras despliegue |
| SEO técnico — Search Console | BLOQUEADO | No hay exportación actual ni acceso a inspección de URL | Exportar cobertura, inspeccionar muestras y validar correcciones |
| Calendarios — código canónico | TERMINADO | Landing final 200 e indexable; redirección interna al destino final presente | Ninguna local |
| Calendarios — subdominio | BLOQUEADO | Producción conserva Netlify 301 → producto antiguo 301 → landing 200 | Cambiar la regla de Netlify/DNS por un único 301 al destino final |
| Consentimiento y política | TERMINADO | CookieConsent MIT opt-in, Consent Mode v2 denegado por defecto, un loader GTM, sin Usercentrics; mapa externo bajo acción explícita; política sincronizada | Validar comportamiento real de etiquetas con Tag Assistant |
| GA4 y Google Ads | BLOQUEADO | El repositorio sólo configura GTM; no permite ver contenedor, propiedades, conversiones ni cuentas | Verificar etiquetas, IDs, duplicados y atribución en cuentas externas |
| Pruebas y compilación | TERMINADO | 295 tests pass, 0 fail, 1 skip; typecheck y build pass; validadores SEO pass; smoke HTTP local pass | Resolver la prueba omitida como P2 |
| Producción y SHA desplegado | PENDIENTE | No se ha desplegado por restricción de alcance | Revisar, integrar, desplegar y registrar SHA/fecha |

## Fase 0 — qué estaba ya terminado

- `edfbf2c` ya integra `09de513`: contacto y presupuestos sólo confirman éxito
  tras una respuesta de servidor completa.
- Los arreglos de calendarios de `040bfc9`, `4a5fe4c` y `e425227` ya cubren
  validación, URLs largas de campañas, errores y tracking. No se repitieron.
- `origin/feat/cookieconsent-migration` es un WIP obsoleto. La migración completa
  a `vanilla-cookieconsent` está en `8e3faca` y ha evolucionado después.
- `origin/fix/home-responsive-image-sizing` está sustituida funcionalmente: el
  tamaño responsive esperado existe en `main` y su prueba pasa.
- `origin/work/seo-organic-20260723` contiene variantes antiguas de noindex,
  schema y auditoría. La indexabilidad, canonicals y schema actuales son
  posteriores y están cubiertos por la suite vigente.
- `origin/work/next` mezcla UI, dependencias y refactors antiguos; no se detectó
  una corrección P0/P1 segura que justificase integrarla.
- De `origin/fix/quote-form-calendars` sólo seguía siendo necesaria la
  conservación de extras del presupuesto genérico. Se portó de forma aislada;
  el resto está sustituido por la consolidación y los arreglos posteriores de
  formularios.

## Correcciones realizadas

### P0 — seguridad

Servicio afectado: **SendGrid**. La clave no se imprime ni se conserva en este
documento.

- La exposición aparece en `content/docs/memoria.md` en `6a4f36e` y ya no está
  en ese fichero a partir de `63f3da3`.
- Esos commits no son antecesores de HEAD. El único ref local que conserva esa
  historia es `refs/original/refs/heads/navMb`; ninguna rama remota local la
  contiene.
- El árbol versionado actual no contiene una credencial con el patrón de
  SendGrid.
- `.env` y `.env.*` están ignorados y no versionados. Existe configuración local,
  pero la comparación no demuestra que la credencial histórica siga activa ni
  que haya sido revocada.
- Se añadió una prueba que informa sólo de rutas afectadas, nunca del valor.
- No se borró historia ni se revocó ninguna clave externa.

La incidencia permanece **BLOQUEADA P0** hasta obtener evidencia de SendGrid:

1. localizar la clave por nombre/fecha sin copiar su valor;
2. revisar último uso, permisos y actividad anómala;
3. si existe, crear sustituta de mínimo privilegio y actualizar secretos de
   despliegue;
4. revocar la clave histórica;
5. registrar fecha, responsable y evidencia no sensible de la revocación.

### P0 — retirada del blog

Se declara `blog.reprodisseny.com` como host retirado:

- URL sin sustituto: `410 Gone`, sin `Location`, con
  `X-Robots-Tag: noindex, follow`.
- `/robots.txt`: `200`, `Allow: /`, sin sitemap. Google debe poder rastrear los
  410; no se bloquea la retirada.
- `/sitemap.xml`: `410`.
- Sólo una URL con equivalencia documentada conserva 301 directo a la guía
  comercial vigente.
- El resto de hosts legacy mantienen su comportamiento anterior.
- La detección usa `X-Forwarded-Host`, coherente con el proxy de producción.

Producción aún no aplica esta política: TLS falla por certificado no válido para
el host y el robots existente bloquea todo. Para retirar el blog correctamente,
debe mantenerse temporalmente el host resoluble con certificado válido y servir
los 301/410 hasta que GSC confirme la desaparición. No debe reactivarse contenido
ni redirigirse indiscriminadamente a la home.

### P1 — formularios

El formulario general de presupuesto enviaba `productType` y `needAdvice`, pero
el backend los descartaba porque `presupuesto-generico` no es un producto del
catálogo CMS. Se añadió un saneamiento cerrado que:

- sólo actúa para `presupuesto-generico`;
- conserva los seis tipos ofrecidos por la interfaz;
- conserva `needAdvice` sólo si es booleano;
- descarta campos inyectados y no altera productos CMS.

Las confirmaciones, reintentos, errores accesibles, honeypot, rate limit, bloqueo
de doble envío y `generate_lead` sólo tras creación ya estaban implementados y
han vuelto a pasar sus pruebas. No se declara verificado ningún envío real.

### P1 — SEO técnico

- La política del blog evita soft 404 y exclusiones por robots que impidan
  descubrir los 410.
- `validate-seo-http.ts` ya no afirma resultados históricos fijos. Deriva del
  código los redirects, paths/prefijos 410, 404 y excepciones existentes, y no
  inventa el resultado de build o typecheck.
- No se cambiaron canonicals, metadatos, schema ni noindex comerciales porque
  los validadores y la evidencia previa no muestran un defecto actual.
- Se mantuvieron las exclusiones intencionadas de búsqueda, agradecimiento,
  filtros no canónicos, API y errores.

Comprobación pública mínima del 20/10/2026:

- `reprodisseny.com/robots.txt`: 200.
- `reprodisseny.com/sitemap.xml`: 200 y 142 `<loc>`.
- `blog.reprodisseny.com`: error de validación TLS; ignorándolo sólo para
  diagnóstico, robots 200 con `Disallow: /`.
- `calendarios.reprodisseny.com`: 301 de Netlify a
  `/productos/calendarios-personalizados`; segundo 301 de Vercel a la landing;
  landing final 200 e indexable.

### P1 — GA4, Ads y consentimiento

Ya existía y se mantiene:

- `vanilla-cookieconsent` 3.1.0 (MIT), modo opt-in y revisión versionada;
- Consent Mode v2 con `analytics_storage`, `ad_storage`, `ad_user_data` y
  `ad_personalization` denegados por defecto;
- una única carga diferida de GTM por `NUXT_PUBLIC_GTM_ID`;
- actualización del consentimiento sin recarga y borrado de cookies por
  categoría;
- persistencia de atribución publicitaria sólo con Marketing aceptado;
- `generate_lead` sin PII, deduplicado y ligado a una creación confirmada;
- ausencia de referencias actuales a Usercentrics.

Correcciones nuevas:

- el iframe de Google Maps no contacta con Google al cargar la página; requiere
  pulsar «Cargar mapa de Google»;
- la política enumera únicamente Necesarias, Analítica y Marketing;
- el inventario publicado coincide con `repro_cookie_consent`, cookies GA4 y
  cookies de Ads configuradas, e informa de Consent Mode y del mapa.

No hay IDs directos de GA4 o Ads en el repositorio: las etiquetas viven, si están
publicadas, dentro de GTM. Sin acceso a GTM/GA4/Ads no se puede demostrar que
exista una única etiqueta, que el trigger de conversión sea correcto ni que Ads
y GA4 compartan la configuración esperada.

## Archivos modificados

P0:

- `shared/seo/legacyRedirects.ts`
- `server/middleware/legacy-notfound-redirect.ts`
- `tests/retired-blog.test.ts`
- `tests/secret-exposure.test.ts`

P1 formularios:

- `server/services/priceRequests/genericQuoteExtras.ts`
- `server/services/priceRequests/priceRequestService.server.ts`
- `tests/generic-quote-extras.test.ts`

P1 consentimiento:

- `components/marketing/LocationMapSection.vue`
- `pages/politica-cookies.vue`
- `tests/cookie-consent.test.ts`

P1 SEO y cierre:

- `scripts/validate-seo-http.ts`
- `tests/seo-redirects.test.ts`
- `docs/audits/seo-closure-2026-10-20.md`

## Pruebas y resultados

| Comprobación | Resultado |
|---|---|
| `npm test` | PASS: 296 tests, 295 aprobados, 0 fallidos, 1 omitido |
| `npm run typecheck` | PASS, código 0 |
| `npm run build` | PASS, build Nuxt/Nitro completo |
| `npm run validate:seo-routes` | PASS: 130 rutas, 12 categorías canónicas |
| `npm run validate:seo-redirects` | PASS: 362 redirects, 31 reglas 410, 3 rutas 404, 2 excepciones, 0 errores/warnings |
| Pruebas P0 específicas | PASS: 15/15 |
| Pruebas de formularios específicas | PASS: 78/78 |
| Pruebas de consentimiento | PASS: 18/18 |
| Smoke del build local | Blog 410/robots 200/301 conocido; robots, sitemap y categoría comercial 200; sitemap 142 URLs |
| Producción pública mínima | Principal 200; blog TLS/robots bloqueados; calendarios con dos 301 antes del 200 |

No existe script `lint`. El build avisa de `caniuse-lite` antiguo, anotaciones de
dependencias y del bloqueo de `/api/**` en robots. El bloqueo de API es
intencionado y no afecta a páginas comerciales; los otros avisos no rompen el
build. La única prueba omitida es la interacción de tabs de categoría, ya
documentada como deuda P2.

No se ejecutó un envío real ni el lote HTTP completo de 122 URLs contra
producción. El primero requiere un lead controlado y acceso a SharePoint; el
segundo debe repetirse después de desplegar este SHA, no contra el estado previo.

## Commits locales generados

- `081f31f` — `test(security): prevent tracked SendGrid credentials`
- `741f090` — `fix(seo): retire cancelled blog host safely`
- `1632846` — `fix(forms): preserve generic quote selections`
- `0bcb12e` — `fix(consent): gate map and align cookie policy`
- `c690071` — `fix(seo): derive HTTP audit evidence from code`
- Documentación de cierre: commit que contiene este fichero.

## Incidencias pendientes por prioridad

### P0

1. **SEC-01 — BLOQUEADO:** acreditar revocación/rotación de la clave histórica de
   SendGrid y revisar su uso.
2. **BLOG-01 — BLOQUEADO:** provisionar TLS válido, enrutar el host al servicio
   que aplique 301/410 y retirar `Disallow: /` sin reactivar el blog.
3. **DEPLOY-01 — PENDIENTE:** integrar y desplegar con flujo aprobado, registrar
   SHA exacto y ejecutar smoke posterior.
4. **GSC-01 — BLOQUEADO:** obtener cobertura e inspección actual para separar
   páginas comerciales erróneamente excluidas de noindex/robots intencionales.

### P1

1. **FORM-01:** enviar leads controlados de contacto, presupuesto genérico y
   calendarios; comprobar recepción y campos en SharePoint; provocar un error
   controlado y confirmar que no hay éxito ni conversión.
2. **MEASURE-01:** usar Tag Assistant en rechazo, sólo Analítica y
   Analítica+Marketing; confirmar una sola etiqueta GA4/Ads y un solo
   `generate_lead` para creación no duplicada.
3. **MEASURE-02:** comprobar en DebugView/GA4 y Ads los IDs, trigger,
   conversiones primarias/secundarias, `gclid`/`gbraid`/`wbraid` y diferencias de
   atribución esperadas.
4. **CAL-01:** sustituir el primer 301 de Netlify por un 301 directo a
   `https://reprodisseny.com/calendarios/calendarios-corporativos-2027`.
5. **RED-01:** repetir el lote de 122 URLs contra el despliegue nuevo y conservar
   la salida fechada del generador ya corregido.

### P2

1. Resolver la prueba omitida de tabs de categoría.
2. Actualizar Browserslist en un cambio separado y validar el lockfile.
3. Revisar los 28 avisos editoriales del CMS sólo con datos de GSC/CTR e intención.
4. Obtener CWV de campo y revisar imágenes/rendimiento en dispositivos reales.

## Riesgos antes del despliegue

- Si DNS del blog no llega a esta aplicación, el código 410 no tendrá efecto.
- Si se elimina DNS antes de servir 410 con TLS válido, Google tardará más en
  confirmar la retirada.
- El contenedor GTM puede contener duplicados o triggers incompatibles que el
  repositorio no permite ver.
- Las pruebas simuladas no acreditan permisos, columnas ni disponibilidad real
  de SharePoint.
- La rama está por delante de `origin/main`; producción puede seguir sirviendo
  `edfbf2c` u otro SHA hasta que se confirme el despliegue.

## Secuencia concreta para cerrar definitivamente

1. Revisar estos commits y fusionarlos mediante el flujo normal del repositorio.
2. Resolver SEC-01 y archivar evidencia no sensible de la revocación.
3. Configurar TLS/DNS/hosting del blog y verificar robots, 301 conocidos y una
   muestra de 410 antes de solicitar validación en GSC.
4. Corregir la regla de Netlify de calendarios a un único salto.
5. Desplegar y registrar SHA, entorno y fecha.
6. Ejecutar smoke de formularios con leads identificables de prueba y confirmar
   SharePoint, errores y ausencia de duplicados.
7. Validar Consent Mode, GA4 y Ads con Tag Assistant/DebugView y guardar capturas
   o exportes sin PII.
8. Exportar GSC, inspeccionar muestras por motivo de exclusión, enviar el sitemap
   canónico y solicitar validación sólo de errores reales.
9. Ejecutar el lote HTTP de 122 URLs y cerrar los P1 restantes con evidencia.
