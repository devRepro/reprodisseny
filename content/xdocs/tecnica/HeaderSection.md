# 📦 HeaderSection.vue

Componente visual que sirve como cabecera destacada para productos, categorías o secciones de contenido.

---

## ✅ Props

| Prop   | Tipo     | Requerido | Descripción |
|--------|----------|-----------|-------------|
| image  | `string` | ✅        | Ruta de la imagen a mostrar a la izquierda |
| alt    | `string` | ❌        | Texto alternativo. Si no se define, se genera automáticamente |
| title  | `string` | ✅        | Título principal que se muestra en la cabecera |

---

## 🧩 Slots

| Slot     | Descripción                                       |
|----------|---------------------------------------------------|
| `right`  | Contenido que se mostrará a la derecha: descripción, botones, formularios, etc. |

---

## 🖼️ Ejemplo de uso

```vue
<HeaderSection
  image="/img/productos/ejemplo.webp"
  title="Impresión personalizada de camisetas"
>
  <template #right>
    <p class="text-muted-foreground">
      Ofrecemos impresión textil profesional en todo tipo de prendas.
    </p>
    <button class="mt-4 bg-primary text-white px-4 py-2 rounded">
      Pide presupuesto
    </button>
  </template>
</HeaderSection>
