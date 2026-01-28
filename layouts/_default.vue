

<template>
  <div class="flex min-h-dvh flex-col">
    <!-- Header -->
    <header
      class="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <SharedHeader />
      <!-- Slot opcional para navegación secundaria de cada página -->
      <slot name="navigation" />
    </header>

    <!-- Contenido -->
    <main class="container mx-auto w-full flex-1 px-4 py-0">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <SharedFooter />
  </div>
</template>
