<script setup lang="ts">
useHead({
  // Los MetaTitle del CMS ya son títulos finales. No añadir la marca otra vez.
  // Se define aquí como función para sustituir el titleTemplate estático global.
  titleTemplate: (titleChunk) => titleChunk || "Imprenta en Barcelona",
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
    <ClientOnly>
      <!-- shadcn-vue: components/ui/sonner -->
      <Toaster
        position="top-right"
        :duration="3500"
        richColors
        :expand="false"
        closeButton
      />
    </ClientOnly>
  </NuxtLayout>
</template>
