<!--Menu navegación categorias-->
<template>
  <nav class="categoryMenu__block">
    <!-- Botón de menú móvil -->
    <div class="flex justify-between items-center sm:hidden">
      <button 
        @click="toggleMenu" 
        class="p-2 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
        aria-controls="mobile-menu"
        :aria-expanded="menuOpen.toString()">
        <span class="sr-only">Abrir menú</span>
        <!-- Icono hamburguesa -->
        <svg v-if="!menuOpen" class="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
        <!-- Icono de cierre -->
        <svg v-else class="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Menú de navegación en escritorio -->
    <ul v-if="docs && docs[0]?.children" class="hidden sm:flex justify-between w-full">
      <li v-for="doc in docs[0].children" :key="doc.path" class="categoryMenu__item">
        <NuxtLink :to="doc.path" class="categoryMenu__link">
          {{ doc.nav }}
        </NuxtLink>
      </li>
    </ul>

    <!-- Menú móvil desplegable -->
    <ul v-if="menuOpen" class="sm:hidden flex flex-col space-y-2 mt-2">
      <li v-for="doc in docs[0].children" :key="doc.path" class="categoryMenu__item">
        <NuxtLink :to="doc.path" class="categoryMenu__link">
          {{ doc.nav }}
        </NuxtLink>
      </li>
      <ul>
      <li>
        <NuxtLink to="/contacto">Contacto</NuxtLink>
      </li>
      <li>
        <NuxtLink to="/novedades">Novedades</NuxtLink>
      </li>
      <li>
        <NuxtLink to="/blog">Blog</NuxtLink>
      </li>
    </ul>
    </ul>
    
  </nav>
</template>

<script setup lang="ts">

  import { ref } from 'vue';

  // Estado para manejar la visibilidad del menú móvil
  const menuOpen = ref(false);
  const toggleMenu = () => {
    menuOpen.value = !menuOpen.value;
  };
     
     const { data: docs } = await useAsyncData("documents-list", () =>
  queryCollectionNavigation("categorias", ["nav"])
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
