  <template>
    <NuxtLayout name="default">
      <template #navigation>
        <div class="bg-white border-b">
          <div class="container mx-auto px-4">
          </div>
        </div>
      </template>
      <AppCrumbs
        class="ml-2"
      />
      <slot />
    </NuxtLayout>
  </template>