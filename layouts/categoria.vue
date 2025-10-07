<!-- layouts/categoria.vue -->
<template>
  <div>
    <!-- Header global ya incluido vía default / global layout o aquí mismo si quieres -->
    <slot name="navigation" />
    <div class="layout-categoria bg-white">
      <slot />
    </div>
  </div>
</template>
