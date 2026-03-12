<template>
  <PageContainer>
    <section class="pb-2">
      <div class="flex flex-wrap gap-3">
        <button
          type="button"
          class="catalog-chip"
          :class="{ 'catalog-chip-active': !selectedCategory }"
          @click="emit('select-category', null)"
        >
          Todos
        </button>

        <button
          v-for="category in categories"
          :key="category.slug"
          type="button"
          class="catalog-chip"
          :class="{ 'catalog-chip-active': selectedCategory === category.slug }"
          @click="emit('select-category', category.slug)"
        >
          {{ category.label }}
        </button>
      </div>
    </section>
  </PageContainer>
</template>