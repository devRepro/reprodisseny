# Auditoría SEO de URLs legacy con respuesta 200

Fecha: 2026-08-05

## Alcance y método

Se revisaron las fuentes locales de rutas, búsqueda, sitemap, redirecciones,
middleware, páginas Nuxt, enlaces internos, robots y cabeceras SEO. Las
comprobaciones de producción reflejan únicamente el despliegue público existente
en la fecha indicada; no demuestran que los cambios de esta rama estén desplegados.

Fuentes principales:

- `cms/routes.json` y `cms/search-index.json` (130 entradas cada uno).
- `shared/seo/legacyRedirects.ts` y `redirect-rules.generated.ts`.
- Sitemap público y endpoint local de sitemap.
- Respuestas HTTP de `https://reprodisseny.com`.
- Búsqueda de referencias internas a `/product/`, `/category/`, `/page/` y rutas técnicas.

## Decisiones y evidencia

| URL o familia | Estado observado en producción | Clasificación | Destino | Acción local | Evidencia |
| --- | ---: | --- | --- | --- | --- |
| `/promo-test` | 404 JSON; `X-Robots-Tag: index, follow` | 410 | — | Añadida a `LEGACY_GONE_PATHS`; excluida explícitamente del sitemap | Era una prueba, ya no existe una página Nuxt ni sustituto válido |
| `/gracias` | 200 HTML; `X-Robots-Tag: noindex, nofollow` | mantener 200 noindex | — | Conservada; exclusión de sitemap y robots centralizada | Página de confirmación usada por formularios |
| `/buscar` | 200 HTML; cabecera global indexable | mantener 200 noindex | — | `noindex, follow` mediante regla canónica; excluida del sitemap | Búsqueda interna sin intención orgánica |
| `/novedades` | Página local 200 con meta `noindex,follow` | mantener 200 noindex | — | `noindex, follow` mediante regla canónica; excluida del sitemap | Página interna mínima sin intención orgánica actual |
| Ruta web inexistente | 404 HTML con `Accept: text/html`; cabecera global indexable | 404 | — | Meta y cabecera `noindex, follow` | Existe `error.vue`; el formato JSON se conserva para clientes que lo solicitan |
| Rutas eliminadas de `LEGACY_GONE_PATHS` y prefijos legacy | 410 local según middleware | 410 | — | Cabecera de error normalizada a `noindex, follow` | No tienen sustituto confirmado |
| `/category/publicidad-en-puntos-de-venta` | 301 | 301 | `/categorias/expositores` | Sin cambios | Respuesta directa observada y regla existente |
| `/category/hosteleria-restauracion` | 301 | 301 | `/categorias/hosteleria-restauracion` | Sin cambios | Respuesta directa observada y regla existente |
| `/category/impresion-digital-gran-formato` | 301 | 301 | `/categorias/gran-formato` | Sin cambios | Respuesta directa observada y regla existente |
| `/category/carteleria` | 301 | 301 | `/categorias/gran-formato` | Sin cambios | Respuesta directa observada y regla existente |
| `/expositores-publicitarios` | 301 | 301 | `/categorias/expositores` | Sin cambios | Respuesta directa observada y regla existente |
| `/product/flyers` | 301 | 301 | `/productos/flyers-personalizados` | Sin cambios | Respuesta directa observada y regla existente |
| `/page/calendarios2026` | 301 | 301 | `/productos/calendarios-personalizados` | Sin cambios | Respuesta directa observada y regla existente |
| `/producto/banderas` | 301 | 301 | `/productos/banderolas-personalizadas` | Sin cambios | Respuesta directa observada y equivalencia ya validada |

No se encontraron rutas `/product/*`, `/category/*`, `/page/*`, `/promo-test`,
`/gracias`, `/buscar` o `/novedades` en `cms/routes.json` ni en
`cms/search-index.json`. El sitemap público contenía 142 URLs y ninguna coincidía
con esas familias o rutas internas. Los resultados antiguos que aún aparecen en
buscadores corresponden a URLs que actualmente responden 301, no 200.

## Casos REVISAR y elementos externos

No quedan equivalencias locales pendientes de decisión.

`https://calendarios.reprodisseny.com/` queda fuera del repositorio:

- Responde 200 con contenido de calendarios 2025.
- Sirve desde Netlify (`server: Netlify`).
- DNS apunta a `calendarios2025.netlify.app`.
- En este repositorio solo figura como host legacy a canonicalizar si la petición
  alcanzase esta aplicación; el tráfico público actual no llega a este Nuxt.

Acción externa necesaria: configurar en el proyecto de Netlify o en DNS una
redirección permanente del subdominio hacia la URL canónica que negocio confirme,
o retirar/noindexar el sitio antiguo. No se ha cambiado DNS, Netlify ni otro
servicio externo desde esta rama.

## Controles reproducibles

- `npm run validate:seo`
- `npm run build`
- `npm run typecheck`
- `npm run validate:seo-http` con Nuxt disponible en `127.0.0.1:3000`
- Comprobar que errores web 404 sirven HTML y `/api/*` conserva JSON.
- Comprobar `X-Robots-Tag` en 200 indexables, 200 noindex, 404 y 410.
