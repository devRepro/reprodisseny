<!-- layouts/categorias.vue -->
<template>
  <NuxtLayout name="default">
    <!-- SLOT de navegación -->
    <template #navigation>
      <div class="bg-white border-b dark:bg-background dark:border-border">
        <div class="container mx-auto px-4">
          <UiNavigationMenuMegaMenu />
        </div>
      </div>
    </template>

    <!-- Breadcrumbs -->
    <AppCrumbs class="ml-2" />

    <!-- Aquí va el contenido del Markdown o de la página -->
    <slot />
  </NuxtLayout>
</template>
