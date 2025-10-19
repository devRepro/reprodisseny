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
