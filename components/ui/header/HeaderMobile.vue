<!-- components/ui/header/headerMobile.vue -->
<script setup lang="ts">
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-vue-next'
</script>

<template>
  <div class="flex items-center justify-between px-4 h-16 border-b border-border md:hidden">
    <!-- Logo -->
    <UiLogoMobile />

    <!-- Menú hamburguesa -->
    <Sheet>
      <SheetTrigger as-child>
        <Button variant="ghost" size="icon" aria-label="Abrir menú">
          <Menu class="h-6 w-6 text-foreground" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" class="w-[260px]">
        <div class="py-4 space-y-6">
          <UiLogoMobile class="mb-4" />

          <nav class="flex flex-col gap-3">
            <NuxtLink to="/categorias/adhesivos" class="menu-link">Adhesivos</NuxtLink>
            <NuxtLink to="/categorias/libros" class="menu-link">Libros</NuxtLink>
            <NuxtLink to="/contacto" class="menu-link">Contacto</NuxtLink>
            <NuxtLink to="/novedades" class="menu-link">Novedades</NuxtLink>
            <NuxtLink to="/blog" class="menu-link">Blog</NuxtLink>
            <NuxtLink to="tel:+34932749890" class="menu-link mt-6">
              📞 +34 93 274 98 90
            </NuxtLink>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>
