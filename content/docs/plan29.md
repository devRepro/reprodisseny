# Plan de Trabajo — 29 de Abril de 2025

**Objetivo del día:**
Refactorizar la página de categorías/productos en componentes reutilizables, crear los composables necesarios, montar el formulario de contacto con envío de emails y establecer la conexión con SharePoint.

---

## 09:00 – 09:30 | Revisión inicial
- Repasar los requerimientos de la jornada y el estado actual del proyecto.
- Comprobar que el entorno de desarrollo funciona correctamente (dependencias, servidor dev).
- Sincronizar con `main` y crear una rama de trabajo: `feature/refactor-hoy`.

## 09:30 – 11:00 | Refactorizar componentes
1. Extraer y crear:
   - `components/CategoryHeader.vue` (título, descripción e imagen).
   - `components/ProductCard.vue` (imagen, título, descripción corta + link “Solicitar precio”).
   - `components/ProductGrid.vue` (grid, spinner, mensaje “sin productos”).
   - `components/Loader.vue` (spinner genérico).
   - `components/ErrorMessage.vue` (bloque de error genérico).
2. Sustituir el código monolítico en `pages/categorias/[...slug].vue` por los nuevos componentes.
3. Probar visualmente y verificar que no hay regressiones.

## 11:00 – 11:15 | Pausa ☕

## 11:15 – 12:30 | Crear composables de datos
1. `composables/useQueryCollection.ts`: abstraer `queryCollection`, `.where()`, `.first()`, `.all()`.
2. `composables/useSendEmail.ts`: lógica para invocar el endpoint de envío de emails.
3. `composables/useSharePoint.ts`: inicializar cliente Graph/PnPjs y exponer métodos básicos.
4. Ajustar las llamadas en la página para usar estos composables.

## 12:30 – 13:30 | Implementar ProductCard y ProductGrid
- Detallar props y eventos en `ProductCard.vue`.
- Integrar `ProductGrid.vue` con pruebas de datos simulados.
- Verificar responsividad y estilos.

## 13:30 – 14:30 | Almuerzo 🍽️

## 14:30 – 15:30 | Formulario de contacto
1. Crear `components/ContactForm.vue` con campos: nombre, email, asunto, mensaje, slug del producto.
2. Composable `useContactoForm.ts` para manejo de estado, validaciones simples y envío via `useSendEmail`.
3. Integrar el formulario en `/contacto` o modal desde `ProductCard.vue`.
4. Pruebas de validación y flujo.

## 15:30 – 16:30 | Endpoint `/api/send-email` y pruebas SendGrid
1. `server/api/send-email.post.ts`: leer `runtimeConfig.SENDGRID_API_KEY`, montar el payload.
2. Probar envío de emails de prueba.
3. Manejo de errores y respuestas HTTP.

## 16:30 – 16:45 | Pausa ☕

## 16:45 – 17:30 | Integración SharePoint
1. `server/api/sharepoint.get.ts` o dentro de `useSharePoint.ts`: autenticación y ejemplo de lectura.
2. Pruebas básicas de lectura/escritura en una lista o archivo.
3. Ajustes de CORS/seguridad si aplica.

## 17:30 – 18:00 | Documentación y cierre
- Añadir este plan a `docs/plan_trabajo_hoy.md`.
- Crear un README parcial en `docs/`: instrucciones para nuevos componentes y composables.
- Hacer commit y push de la rama `feature/refactor-hoy`.
- Abrir pull request con descripción de avances.

---

**Entregables al final del día:**
- Código refactorizado con componentes reutilizables.
- Formulario de contacto funcional y endpoint SendGrid testeado.
- Conexión básica a SharePoint establecida.
- Documentación actualizada en `docs/plan_trabajo_hoy.md` y `docs/README.md`.

¡A por ello! 🚀

