<template>
  <nav class="relative">
    <ul v-if="docs?.[0]?.children?.length" class="flex justify-between rounded-t-md rounded-b-none categoryMenu">
      <li
        v-for="item in docs[0].children"
        :key="item.path"
        class="relative"
        @mouseenter="showCategory(item)"
        @mouseleave="hideCategory"
      >
        <NuxtLink :to="item.path" class="block px-4 py-2" @click="activeCategory = null">
          {{ item.nav }}
        </NuxtLink>
      </li>
    </ul>

    <!-- Submenú desplegable de ancho completo -->
    <transition name="fade">
      <div
        v-if="activeCategory"
        class="absolute left-0 right-0 top-full mt-2 bg-white text-black p-4 rounded shadow-lg z-50"
        @mouseenter="cancelHide"
        @mouseleave="hideCategory"
        @click="activeCategory = null"
      >
        <CategoryProducts :category="activeCategory.slug" />
      </div>
    </transition>
  </nav>
</template>

<script setup lang="ts">
const { data: docs } = await useCategoriasNav();
const activeCategory = ref<any>(null);
let hideTimeout: number | null = null;

function showCategory(item: any) {
  cancelHide();
  activeCategory.value = item;
}

function hideCategory() {
  hideTimeout = window.setTimeout(() => {
    activeCategory.value = null;
  }, 200); // Retardo de 200ms, ajustable según prefieras
}

function cancelHide() {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
}
</script>

<style scoped lang="scss">
.categoryMenu {
  background-color: #1a1c20;
  color: #fff;

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
