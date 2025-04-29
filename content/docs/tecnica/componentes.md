# 📁 UI Component Architecture

Este directorio contiene los componentes de UI reutilizables del proyecto. Está inspirado en Shadcn UI y sigue buenas prácticas para mantener una estructura limpia, escalable y profesional.

## Convenciones

- Prefijo `Ui` para componentes reutilizables: `UiButton`, `UiTooltip`, etc.
- Componentes contextuales como `Header.vue`, `Logo.vue` no llevan `Ui`.
- Variantes como `HeaderMobile.vue` se agrupan con su versión principal.

## Estructura sugerida

components/ui/
├── button/UiButton.vue
├── logo/Logo.vue
├── logo/LogoMobile.vue
├── header/Header.vue
├── header/HeaderMobile.vue
...

## Buenas prácticas

- Evitar archivos index.ts innecesarios.
- Usar Tailwind y estilos consistentes.