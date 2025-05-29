<script setup lang="ts">

import { Menu } from 'lucide-vue-next'

</script>

<template>
  <div class="flex items-center justify-between px-4">
    <!-- Logo móvil -->
    <LogoMobile />

    <!-- Botón hamburguesa -->
    <Sheet>
      <SheetTrigger as-child>
        <Button variant="ghost" size="icon" class="md:hidden">
          <Menu class="h-6 w-6" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" class="w-[260px]">
        <!-- Contenido del menú móvil -->
        <div class="py-4 space-y-4">
          <LogoMobile class="mb-4" />

          <nav class="flex flex-col space-y-2">
            <NuxtLink to="/categorias/adhesivos" class="menu-link">Adhesivos</NuxtLink>
            <NuxtLink to="/categorias/libros" class="menu-link">Libros</NuxtLink>
            <NuxtLink to="/contacto" class="menu-link">Contacto</NuxtLink>
            <NuxtLink to="/novedades" class="menu-link">Novedades</NuxtLink>
            <NuxtLink to="/blog" class="menu-link">Blog</NuxtLink>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>

