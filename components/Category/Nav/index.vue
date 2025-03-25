<template>
  <nav ref="navElement" class="categoryMenu__block relative">
    <!-- Botón de menú móvil -->
    <div class="flex justify-between items-center sm:hidden">
      <button 
        @click="toggleMenu" 
        class="p-2 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
        aria-controls="mobile-menu"
        :aria-expanded="menuOpen ? 'true' : 'false'">
        <span class="sr-only">Abrir menú</span>
        <svg v-if="!menuOpen" class="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
        <svg v-else class="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Menú de navegación en escritorio -->
    <ul v-if="computedDocs.length > 0" class="hidden sm:flex justify-between w-full">
      <li v-for="doc in computedDocs" :key="doc._path" class="categoryMenu__item">
        <div class="categoryContainer" 
             @mouseover="showSubmenu(doc.slug)" 
             @mouseleave="startHideTimer">

          <NuxtLink :to="doc._path" class="categoryMenu__link">
            {{ doc.nav || doc.title }}
          </NuxtLink>

          <!-- Submenú con productos -->
          <div 
            v-if="hoveredCategory === doc.slug && doc.products?.length"
            class="submenu"
            :style="{ width: navWidth + 'px' }"
            @mouseover="cancelHideTimer"
            @mouseleave="startHideTimer"
          >
            <ul class="grid grid-cols-3 gap-4 p-4">
              <li v-for="product in doc.products" :key="product._path">
                <NuxtLink :to="product._path" class="text-white hover:underline">
                  {{ product.nav || product.title }}
                </NuxtLink>
              </li>
            </ul>
          </div>

        </div>
      </li>
    </ul>

    <!-- Menú móvil desplegable -->
    <ul v-if="menuOpen" class="sm:hidden flex flex-col space-y-2 mt-2">
      <li v-for="doc in computedDocs" :key="doc._path" class="categoryMenu__item">
        <NuxtLink :to="doc._path" class="categoryMenu__link">
          {{ doc.nav || doc.title }}
        </NuxtLink>
        <ul v-if="doc.products?.length" class="ml-4 text-sm text-white">
          <li v-for="product in doc.products" :key="product._path">
            <NuxtLink :to="product._path">{{ product.nav || product.title }}</NuxtLink>
          </li>
        </ul>
      </li>
      <li><NuxtLink to="/contacto">Contacto</NuxtLink></li>
      <li><NuxtLink to="/novedades">Novedades</NuxtLink></li>
      <li><NuxtLink to="/blog">Blog</NuxtLink></li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { queryContent } from '#content';

// Estado del menú
const menuOpen = ref(false);
const toggleMenu = () => (menuOpen.value = !menuOpen.value);

// Hover submenu
const hoveredCategory = ref<string | null>(null);
let hideTimer: ReturnType<typeof setTimeout> | null = null;
const showSubmenu = (slug: string) => {
  if (hideTimer) clearTimeout(hideTimer);
  hoveredCategory.value = slug;
};
const startHideTimer = () => {
  hideTimer = setTimeout(() => (hoveredCategory.value = null), 200);
};
const cancelHideTimer = () => {
  if (hideTimer) clearTimeout(hideTimer);
};

// Referencia al ancho del menú
const navElement = ref<HTMLElement | null>(null);
const navWidth = ref<number>(0);
onMounted(() => {
  nextTick(() => {
    if (navElement.value) navWidth.value = navElement.value.offsetWidth;
  });
  window.addEventListener("resize", () => {
    if (navElement.value) navWidth.value = navElement.value.offsetWidth;
  });
});

// Cargar categorías y productos
const { data: categories } = await useAsyncData('categories', async () => {
  const cats = await queryContent('/categorias')
    .where({ _file: 'index.md' })
    .only(['title', 'nav', 'slug', 'path', '_path'])
    .sort({ nav: 1 })
    .find();

  const categoriesWithProducts = await Promise.all(
    cats.map(async (cat) => {
      const products = await queryContent(`${cat._path}/productos`)
        .only(['title', 'nav', 'slug', '_path'])
        .find();
      return {
        ...cat,
        products
      };
    })
  );

  return categoriesWithProducts;
});

const computedDocs = computed(() =>
  categories.value && Array.isArray(categories.value) ? categories.value : []
);
</script>

<style scoped>
.categoryMenu__block {
  background: #1a1c20;
  border-radius: 4px;
  color: #FFF;
  display: flex;
  font-size: 14px;
  gap: 10px;
  padding: 8px 16px;
  position: relative;
}

.categoryMenu__item {
  list-style: none;
  position: relative;
}
.categoryContainer {
  position: relative;
  display: inline-block;
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
.submenu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(30, 30, 30, 0.95);
  color: white;
  transition: opacity 0.3s ease-in-out;
  z-index: 10;
}
</style>
