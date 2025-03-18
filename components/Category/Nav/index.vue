<script setup>
const { data: navigation } = await useAsyncData('navigation', () =>
  queryCollectionNavigation('categorias')
    .where('draft', '=', false)
    .order('title', 'ASC')
)
</script>

<template>
  <nav class="categoryMenu__block">
    <ul class="flex flex-wrap gap-4 justify-center">
      <li v-for="item in navigation" :key="item.path" class="categoryMenu__item">
        <NuxtLink :to="item.path" class="categoryMenu__link flex items-center gap-2">
          <img v-if="item.image" :src="item.image" :alt="item.title" class="w-8 h-8 rounded-full object-cover" />
          <span class="text-lg font-medium">{{ item.title }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.categoryMenu__block {
  background: #1a1c20;
  border-radius: 4px;
  padding: 10px 20px;
}

.categoryMenu__item {
  list-style: none;
}

.categoryMenu__link {
  display: flex;
  align-items: center;
  color: #ffffff;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background 0.3s ease-in-out;
}

.categoryMenu__link:hover {
  background: #333;
}
</style>
