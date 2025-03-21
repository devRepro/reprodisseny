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
    <ul v-if="computedDocs.length > 0 && computedDocs[0]?.children" class="hidden sm:flex justify-between w-full">
      <li v-for="doc in computedDocs[0].children" 
          :key="doc.path" 
          class="categoryMenu__item">
        
        <!-- Contenedor de la categoría -->
        <div class="categoryContainer" 
            @mouseover="showSubmenu(doc.slug)" 
            @mouseleave="startHideTimer">
          
          <!-- Enlace de la categoría -->
          <NuxtLink :to="doc.path" class="categoryMenu__link">
            {{ doc.nav }}
          </NuxtLink>
        </div>
      </li>
    </ul>

    <!-- Div desplegable debajo del nav -->
    <div 
      v-if="hoveredCategory" 
      class="submenu"
      :style="{ width: navWidth + 'px' }"
      @mouseover="cancelHideTimer"
      @mouseleave="startHideTimer">
      Contenido de la categoría: {{ hoveredCategory }}
    </div>

    <!-- Menú móvil desplegable -->
    <ul v-if="menuOpen" class="sm:hidden flex flex-col space-y-2 mt-2">
      <li v-for="doc in computedDocs[0].children" :key="doc.path" class="categoryMenu__item">
        <NuxtLink :to="doc.path" class="categoryMenu__link">
          {{ doc.nav }}
        </NuxtLink>
      </li>
      <ul>
        <li><NuxtLink to="/contacto">Contacto</NuxtLink></li>
        <li><NuxtLink to="/novedades">Novedades</NuxtLink></li>
        <li><NuxtLink to="/blog">Blog</NuxtLink></li>
      </ul>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';

// Estado para manejar la visibilidad del menú móvil
const menuOpen = ref(false);
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

// Estado para mostrar el div desplegable y evitar ocultarlo prematuramente
const hoveredCategory = ref<string | null>(null);
let hideTimer: ReturnType<typeof setTimeout> | null = null;

// Referencia al elemento nav para calcular el ancho dinámico
const navElement = ref<HTMLElement | null>(null);
const navWidth = ref<number>(0);

// Obtener el ancho del nav cuando el componente se monta
onMounted(() => {
  nextTick(() => {
    if (navElement.value) {
      navWidth.value = navElement.value.offsetWidth;
    }
  });

  // Recalcular el ancho en caso de redimensionar la ventana
  window.addEventListener("resize", () => {
    if (navElement.value) {
      navWidth.value = navElement.value.offsetWidth;
    }
  });
});

// Función para mostrar el submenu
const showSubmenu = (slug: string) => {
  if (hideTimer) clearTimeout(hideTimer);
  hoveredCategory.value = slug;
};

// Función para ocultar el submenu con un delay
const startHideTimer = () => {
  hideTimer = setTimeout(() => {
    hoveredCategory.value = null;
  }, 200); // Pequeño delay para evitar desaparición brusca
};

// Cancelar el temporizador si el mouse entra en el div
const cancelHideTimer = () => {
  if (hideTimer) clearTimeout(hideTimer);
};

// Cargar categorías
const { data: docs } = await useAsyncData("documents-list", async () =>  {
  const categories = await queryCollectionNavigation("categorias", ["nav", "slug"]);
  return categories || [];
});

// ✅ Computed para asegurar que docs.value siempre sea un array
const computedDocs = computed(() => (docs.value && Array.isArray(docs.value) ? docs.value : []));
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

/* Contenedor de la categoría */
.categoryContainer {
  position: relative;
  display: inline-block;
}

/* Enlace de categoría */
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

/* Estilos del div desplegable */
.submenu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  height: 150px;
  background: rgba(30, 30, 30, 0.95);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease-in-out;
  opacity: 1;
  z-index: 10;
}
</style>
