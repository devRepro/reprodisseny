# REF-PUBLICACIONES-SEO-01

## Auditoría previa (16/11/2026)

- Workspace limpio en `main`, base `b4f0686`. Rama: `feat/publicaciones-editorial-seo`.
- Nuxt 3, Vue 3, TypeScript, Tailwind y SCSS. SSR con Nitro; `/productos/**` usa ISR de 600 s. Idioma comercial: español, sin rutas comerciales multilingües activas equivalentes.
- Categorías y productos proceden de `cms/catalog.json`, `cms/routes.json` y `cms/search-index.json`, generados por `scripts/sync-cms.ts` desde SharePoint. No se modifica SharePoint ni la base operativa.
- Categoría dinámica: `pages/categorias/[...slug].vue`; producto dinámico: `pages/productos/[...slug].vue`. Las páginas comerciales estáticas ya existen en `pages/lp` y `pages/calendarios`.
- Eventos usa `CommercialJson`: `CategoryHero` comercial y `CommercialSolutions` para confianza, agrupaciones, proyecto y casos de uso. Estilos comunes en `assets/styles/main.scss`: Figtree, tokens existentes, `container-content`, imágenes cuadradas y 4:3, columnas adaptadas por breakpoint. Se conservan sin cambios de CSS.
- Publicaciones conserva ID, URL, secciones técnicas (detalles, tipos, formatos, acabados), proceso y cinco FAQs. Las pestañas usan `keep-mounted`, con todo el contenido en SSR.
- Siete productos reales: `encuadernacion-wire-o-oculto`, `cosida-tapa-blanda`, `encuadernacion-cosida-tapa-dura`, `encuadernacion-encolada-tapa-blanda`, `encuadernacion-wire-o`, `encuadernado-con-grapas`, `hojas-sueltas-archivadores`. No se modifican sus registros, relaciones ni URLs.
- No hay páginas comerciales equivalentes activas de catálogos o revistas. El mapa `.seo-audit/legacy-migration-master.csv` conserva la URL antigua de revistas; su contenido no está archivado. La redirección actual lleva a la categoría general.
- Fotografías disponibles: imagen de categoría de 350×321, siete imágenes de producto de 1200×1200, tres fotografías de detalle registradas en `server/data/category-detail-gallery.json`. Se reutiliza exclusivamente multimedia de la marca, sin atribuir clientes ni trabajos nuevos.
- Trayectoria desde 1983 contrastada en `pages/sobre-nosotros.vue` y en Eventos. El asesoramiento y la producción editorial se documentan en los contenidos actuales de Publicaciones.
- Canonical y schema de categorías se generan desde el DTO; sitemap desde `/api/__sitemap__/urls`. Las nuevas páginas usarán el registro de rutas estáticas del mismo endpoint, sin productos ficticios.
- `quote/FormSection.vue` ya acepta categoría, nombre y slug comercial y conserva origen/UTM. Las landings reutilizan este formulario y su medición existente, sin tocar consentimiento ni CRM. No se enviarán solicitudes reales durante las pruebas.
- Homepage tiene un bloque de enlaces editoriales reutilizable. Blog externo: la URL solicitada no fue recuperable (502); además el código clasifica su host como retirado. Se documentará el enlace recomendado y se comprobará su estado antes de cualquier actuación externa.

## Alcance y decisiones

Se amplía la configuración comercial existente con aplicaciones, CTA por grupo y texto del catálogo. Valores opcionales: Eventos y Expositores conservan su configuración y comportamiento. Dos páginas comerciales estáticas comparten un componente que usa los productos vivos del catálogo y el formulario actual. No hay dependencias nuevas, nueva landing de libros, despliegue ni merge automático.

El navegador integrado no ha podido arrancar por un error de infraestructura (`sandboxPolicy` ausente), repetido al reanudar el 17/11/2026. La revisión se realiza con Chrome local y el verificador del repositorio: capturas, mediciones responsive, navegación por teclado y formularios interceptados, sin escrituras externas.
