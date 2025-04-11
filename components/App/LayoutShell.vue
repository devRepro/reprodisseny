
<template>
  <div class="flex flex-col min-h-screen bg-white">
    <header class="py-4 shadow-md">
      <UiHeader />
      
    </header>
    <MenuCat />
    <main class="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <slot name="top" />
        <UiBreadcrumbBreadcrumbsComponent v-if="$route.name !== 'index'" />
      <slot />
    </main>

    <UiFooter />
  </div>
</template>
