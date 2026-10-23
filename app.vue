<template>
  <NuxtLayout>
    <NuxtPage />
    <ClientOnly>
      <!-- shadcn-vue: components/ui/sonner -->
      <Toaster
        class="site-toaster"
        position="top-right"
        :duration="3500"
        richColors
        :expand="false"
        closeButton
        :style="{ maxWidth: 'calc(100vw - 2rem)' }"
      />
    </ClientOnly>
  </NuxtLayout>
</template>
