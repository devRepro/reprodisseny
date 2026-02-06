---
title: TODO - Proyecto Reprodisseny Nuxt 3
description: >-
  Lista de tareas pendientes para mejorar la aplicación web, enfocada en
  robustez, UX, SEO y profesionalismo. Ordenadas por prioridad descendente.
type: doc
private: true
createdAt: '2025-04-15'
updatedAt: '2025-04-15'
toc: true
head:
  meta:
    - name: robots
      content: 'noindex, nofollow'
---
# TODO - Proyecto Reprodisseny Nuxt 3

Lista de tareas pendientes para mejorar la aplicación web, enfocada en robustez, UX, SEO y profesionalismo. Ordenadas por prioridad descendente.

## 🚀 PRIORIDAD CRÍTICA (Ahora Mismo - Bloqueador)

*   [ ] **Resolver Problemas Mega Menú:**
    *   [ ] Diagnosticar y corregir los problemas específicos reportados (requiere revisión del código `UiNavigationMenuMegaMenu.vue` y relacionados). **<-- ¡EMPEZAR AQUÍ!**
    *   [ ] Asegurar funcionamiento correcto y responsivo (desktop/mobile).
    *   [ ] Verificar navegación por teclado.

## 📈 PRIORIDAD ALTA (Próximos Pasos Fundamentales)

*   [ ] **Implementar Schema.org (JSON-LD):**
    *   [ ] Crear lógica (composable o helper) para generar JSON-LD dinámicamente.
    *   [ ] Implementar schema `Product` en las páginas de producto usando datos del frontmatter.
    *   [ ] Implementar schema `CollectionPage` (con `itemListElement` si es posible) en las páginas de categoría.
    *   [ ] Validar con la [Herramienta de prueba de resultados enriquecidos de Google](https://search.google.com/test/rich-results).
*   [ ] **Generar Sitemap Dinámico:**
    *   [ ] Instalar y configurar `nuxt-simple-sitemap`.
    *   [ ] Asegurar que incluya todas las páginas de categorías y productos generadas por `@nuxt/content`.
*   [ ] **Crear/Configurar `robots.txt`:**
    *   [ ] Añadir un archivo `robots.txt` (estático o vía módulo `nuxt-robots`).
    *   [ ] Permitir rastreo de páginas importantes (`/categorias/`, `/productos/`, etc.).
    *   [ ] Bloquear rutas innecesarias (si las hay).
    *   [ ] Enlazar al `sitemap.xml`.
*   [ ] **Planificar Dashboard de Administración:**
    *   [ ] **Decisión tomada:** Crear como **Aplicación Nuxt Separada** (ej. `admin.reprodisseny.com`).
    *   [ ] Definir funcionalidades iniciales (visualización Analytics/Ads).
*   [ ] **(Cuando se inicie el Dashboard)** **Implementar Autenticación Segura (Dashboard):**
    *   [ ] **Decisión tomada:** Usar **Azure Active Directory (Office 365)** para el login.
    *   [ ] Investigar/Seleccionar módulo o librería Nuxt 3 para OAuth/OIDC con Azure AD.
*   [ ] **(Cuando se inicie el Dashboard)** **Crear Rutas de Servidor Seguras (Dashboard):**
    *   [ ] Crear endpoints en `/server/api/` (protegidos por autenticación) para actuar como Backend-for-Frontend (BFF).
    *   [ ] Implementar llamadas a las APIs de Google (Analytics, Ads) desde estos endpoints usando credenciales seguras (`runtimeConfig`).

## 🛠️ PRIORIDAD MEDIA (Mejoras Esenciales UX/SEO/Contenido)

*   [ ] **Revisión y Mejora de Accesibilidad (A11y):**
    *   [ ] Verificar contraste de colores (especialmente con `color-mode`).
    *   [ ] Testear navegación completa por teclado (menús, formularios, búsqueda, carruseles).
    *   [ ] Revisar uso semántico de HTML y ARIA attributes donde sea necesario.
    *   [ ] Probar con lector de pantalla (NVDA, VoiceOver).
*   [ ] **Optimización Mobile First:**
    *   [ ] Revisar y refinar específicamente el Mega Menú (una vez funcione) en móviles.
    *   [ ] Revisar y refinar los formularios en móviles.
    *   [ ] Testear en diferentes dispositivos y tamaños de pantalla.
*   [ ] **Feedback de Usuario Explícito:**
    *   [ ] Confirmar que el formulario de contacto muestra mensajes claros de éxito/error.
    *   [ ] Planificar e implementar feedback para futuras acciones (ej. búsqueda sin resultados, añadir a carrito si aplica, etc.).
*   [ ] **Verificar URLs Canónicas:**
    *   [ ] Asegurar que Nuxt está generando correctamente las etiquetas `link rel="canonical"` en todas las páginas.
*   [ ] **Estrategia de Enlazado Interno (Implementación Técnica):**
    *   [ ] En páginas de categoría, añadir lógica para listar/enlazar a sus productos.
    *   [ ] En páginas de producto, añadir lógica para enlazar a su categoría y quizás a productos relacionados (si aplica).

## 📝 PRIORIDAD BAJA / CONTINUO (Mantenimiento, Futuro, Documentación)

*   [ ] **Iniciar Documentación Interna:**
    *   [ ] **Decisión tomada:** Empezar usando `/content/docs` con `@nuxt/content`.
    *   [ ] Crear estructura inicial (ej. setup, componentes clave, decisiones arquitectónicas).
*   [ ] **Simplificar Estructura `index.md` Categoría (Opcional):**
    *   [ ] Evaluar si la estructura `content/categorias/[nombre-categoria]/categoria/index.md` es necesaria.
    *   [ ] Considerar mover a `content/categorias/[nombre-categoria]/index.md` o `_index.md` si simplifica y no rompe nada.
*   [ ] **Monitorización de Rendimiento (CWV):**
    *   [ ] Configurar herramientas (ej. PageSpeed Insights, `web-vitals` en el cliente) para monitorizar Core Web Vitals post-lanzamiento.
    *   [ ] Optimizar JS/CSS/Imágenes según sea necesario (trabajo continuo).
*   [ ] **Estrategia de Contenido y Keywords (Ejecución):**
    *   [ ] Realizar investigación de palabras clave (trabajo continuo).
    *   [ ] Crear y optimizar contenido de alta calidad para categorías y productos (trabajo continuo).
*   [ ] **Configurar Herramientas de Monitorización SEO:**
    *   [ ] Configurar Google Search Console.
    *   [ ] Configurar Google Analytics (o alternativa).
*   [ ] **Considerar SEO Local (Si Aplica):**
    *   [ ] Implementar schema `LocalBusiness` si el enfoque es geográfico.
*   [ ] **Escalabilidad de Búsqueda (Observar):**
    *   [ ] Monitorizar rendimiento de `fuse.js` a medida que crece el catálogo. Considerar alternativas si se vuelve lento.
*   [ ] ***(Futuro)* Planificar Migración de Documentación:**
    *   [ ] Evaluar si la documentación interna necesita evolucionar a una herramienta dedicada como **VitePress** si se vuelve más compleja o pública.
*   [ ] ***(Futuro)* Investigar Integración con Sage 200:**
    *   [ ] Investigar API disponible de Sage 200.
    *   [ ] Definir claramente los requisitos de integración (qué datos, qué dirección, frecuencia).
    *   [ ] Planificar el enfoque técnico (middleware dedicado vs. server routes).
