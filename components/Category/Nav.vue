<template>
  <nav>
    <ul v-if="docs?.[0]?.children?.length" class="flex gap-4 categoryMenu">
      <li
        v-for="item in docs[0].children"
        :key="item._path"
        class="relative"
        @mouseenter="onEnter(item._path)"
        @mouseleave="onLeave"
      >
        <NuxtLink :to="item._path" class="block px-4 py-2">
          {{ item.title }}
        </NuxtLink>

        <!-- Submenú solo cuando está activo -->
        <div
          v-if="activeCategory === item._path"
          class="absolute left-0 top-full mt-2 bg-white text-black p-4 rounded shadow-lg z-50 min-w-[250px]"
          @mouseenter="onEnter(item._path)"
          @mouseleave="onLeave"
        >
          <p class="font-semibold mb-2">Productos de {{ item.title }}</p>
          <!-- Cargar productos de la categoría -->
          <CategoryProducts :categoriaSlug="item.slug" />
        </div>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">


const { data: docs } = await useCategoriasNav()

const activeCategory = ref<string | null>(null)
let hideTimeout: ReturnType<typeof setTimeout> | null = null

function onEnter(path: string) {
  if (hideTimeout) clearTimeout(hideTimeout)
  activeCategory.value = path
}

function onLeave() {
  hideTimeout = setTimeout(() => {
    activeCategory.value = null
  }, 200)
}
</script>

<style scoped>
.categoryMenu {
  background-color: #333;
  color: #fff;
}
.categoryMenu a {
  color: #fff;
  display: block;
}
.categoryMenu li:hover > a {
  background-color: #444;
}
</style>
