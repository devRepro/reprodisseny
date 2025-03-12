<template>
  <div class="flex flex-col min-h-screen">
    <!-- Navbar -->
    <header class="bg-blue-600 text-white py-4 shadow-md">
      <div class="container mx-auto flex justify-between items-center px-4">
        <!-- Logo -->
        <NuxtLink to="/" class="text-2xl font-bold">Logo</NuxtLink>

        <!-- Desktop Menu -->
        <nav class="hidden md:flex space-x-6">
          <NuxtLink to="/" class="hover:underline">Inicio</NuxtLink>
          <NuxtLink to="/about" class="hover:underline">Sobre Nosotros</NuxtLink>
          <NuxtLink to="/contact" class="hover:underline">Contacto</NuxtLink>
        </nav>

        <!-- Mobile Menu Button -->
        <button @click="toggleMenu" class="md:hidden">
          <Icon name="heroicons-outline:menu" class="w-6 h-6" />
        </button>
      </div>

      <!-- Mobile Dropdown Menu -->
      <div v-if="menuOpen" class="md:hidden bg-blue-700 py-2">
        <NuxtLink to="/" class="block py-2 px-4 text-white hover:bg-blue-500">Inicio</NuxtLink>
        <NuxtLink to="/about" class="block py-2 px-4 text-white hover:bg-blue-500">Sobre Nosotros</NuxtLink>
        <NuxtLink to="/contact" class="block py-2 px-4 text-white hover:bg-blue-500">Contacto</NuxtLink>
      </div>
    </header>

    <!-- Main Content Layout -->
    <main class="flex-1 container mx-auto px-4 py-8">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white text-center py-4 mt-6">
      <p>© {{ new Date().getFullYear() }} Mi Proyecto. Todos los derechos reservados.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const menuOpen = ref(false);
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};
</script>
