<template>
  <nav class="relative">
    <!-- Menú de categorías -->
    <ul v-if="docs?.[0]?.children?.length" class="flex justify-between categoryMenu">
      <li
        v-for="item in docs[0].children"
        :key="item.path"
        class="relative"
        @mouseenter="activeCategory = item"
        @mouseleave="activeCategory = null"
      >
        <NuxtLink :to="item.path" class="block px-4 py-2" @click="activeCategory = null">
          {{ item.title }}
        </NuxtLink>
      </li>
    </ul>

    <!-- Submenú desplegable centrado y de ancho completo -->
    <transition name="fade">
      <div
        v-if="activeCategory"
        class="absolute left-0 right-0 top-full mt-2 bg-white text-black p-4 rounded shadow-lg z-50"
        @mouseenter="activeCategory = activeCategory"
        @mouseleave="activeCategory = null"
        @click="activeCategory = null"
      >
        <CategoryProducts :category="activeCategory.slug" />
      </div>
    </transition>
  </nav>
</template>

<script setup lang="ts">
const { data: docs } = await useCategoriasNav()
const activeCategory = ref(null)
</script>

<style scoped>
.categoryMenu {
  background-color: #1a1c20;
  color: #fff;
  border-radius: 0.3rem;
}

.categoryMenu a {
  color: #fff;
  display: block;
}

.categoryMenu li:hover > a {
  background-color: #666;
  text-decoration: none;
}

/* Transición para el submenú */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
