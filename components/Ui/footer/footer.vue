<template>
  <footer class="text-gray-600 body-font border-t border-gray-200">
    <!-- Newsletter + Branding -->
    <div class="container px-5 py-10 mx-auto flex flex-col md:flex-row md:items-center md:justify-between">
      <div class="w-full md:w-1/3 mb-8 md:mb-0 text-center md:text-left">
        <h2 class="text-lg font-medium text-gray-900 mb-2">Suscríbete a nuestro newsletter</h2>
        <form @submit.prevent class="flex justify-center md:justify-start">
          <input
            type="email"
            placeholder="Tu correo"
            required
            class="w-2/3 md:w-full px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            class="px-5 py-2 bg-blue-500 text-white font-medium rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Suscribir
          </button>
        </form>
      </div>
      <!-- Navegación -->
      <div class="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div v-for="(col, i) in navColumns" :key="i">
          <h3 class="title-font font-medium text-gray-900 tracking-widest text-sm mb-3">{{ col.title }}</h3>
          <ul class="list-none mb-10">
            <li v-for="(link, idx) in col.links" :key="idx">
              <NuxtLink :to="link.href" class="text-gray-600 hover:text-gray-800 block py-1">
                {{ link.text }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Contacto y Social -->
    <div class="bg-gray-100">
      <div class="container mx-auto py-6 px-5 flex flex-col sm:flex-row items-center justify-between">
        <div class="text-center sm:text-left mb-4 sm:mb-0">
          <p class="text-gray-500 text-sm">© {{ currentYear }} — Repro Disseny</p>
          <p class="text-gray-500 text-sm mt-1">Calle Falsa 123, Ciudad, País</p>
          <p class="text-gray-500 text-sm mt-1">+34 123 456 789 • info@reprodisseny.com</p>
        </div>
        <div class="flex space-x-4">
          <!-- Facebook -->
          <a href="#" aria-label="Facebook" class="text-gray-500 hover:text-gray-700">
            <svg fill="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" class="w-5 h-5">
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
            </svg>
          </a>
          <!-- Twitter -->
          <a href="#" aria-label="Twitter" class="text-gray-500 hover:text-gray-700">
            <svg fill="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" class="w-5 h-5">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0016 3a4.48 4.48 0 00-4.47 5.1 12.94 12.94 0 01-9.44-4.8s-3 7 4 10a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
            </svg>
          </a>
          <!-- Instagram -->
          <a href="#" aria-label="Instagram" class="text-gray-500 hover:text-gray-700">
            <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" class="w-5 h-5">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"></path>
            </svg>
          </a>
          <!-- LinkedIn -->
          <a href="#" aria-label="LinkedIn" class="text-gray-500 hover:text-gray-700">
            <svg fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="0" viewBox="0 0 24 24" class="w-5 h-5">
              <path stroke="none" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path>
              <circle cx="4" cy="4" r="2" stroke="none"></circle>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear();

const navColumns = [
  {
    title: 'Productos',
    links: [
      { text: 'Digital', href: '/productos/digital' },
      { text: 'Offset', href: '/productos/offset' },
      { text: 'Gran Formato', href: '/productos/gran-formato' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { text: 'Sobre Nosotros', href: '/sobre' },
      { text: 'Blog', href: '/blog' },
      { text: 'Carreras', href: '/carreras' },
    ],
  },
  {
    title: 'Soporte',
    links: [
      { text: 'Centro de Ayuda', href: '/ayuda' },
      { text: 'Términos', href: '/terminos' },
      { text: 'Política de Privacidad', href: '/privacidad' },
    ],
  },
  {
    title: 'Categorías',
    links: [
      { text: 'Arte', href: '/categoria/arte' },
      { text: 'Fotografía', href: '/categoria/fotografia' },
      { text: 'Diseño', href: '/categoria/diseno' },
    ],
  },
];
</script>
