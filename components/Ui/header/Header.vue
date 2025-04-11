<template>
  <header class="text-gray-600">
    <div class="container mx-auto flex items-center justify-between p-2 gap-6">
      
      <!-- Logo a la izquierda -->
      <a href="/" class="flex items-center shrink-0">
        <UiLogo />
      </a>

      <!-- Buscador + Menú a la derecha -->
      <div id="buscar" class="flex items-center gap-6 flex-1 justify-end">
        
        <!-- Buscador -->
        <div class="relative w-[280px]">
          <Input
            id="search"
            type="text"
            placeholder="Escribe lo que necesitas imprimir..."
            class="pl-10 w-full text-gray-900 placeholder:text-gray-400"
          />
          <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
            <Icon name="lucide:search" class="size-6 text-muted-foreground" />
          </span>
        </div>

        <!-- Menú -->
        <nav class="flex items-center space-x-5 whitespace-nowrap text-sm">
          <a class="flex items-center hover:text-gray-900" href="tel:+34932749890">
            <Icon name="tabler:phone-call" style="color: #888888" size="1.25rem" class="mr-2" />
            <span>+34 93 274 98 90</span>
          </a>
          <a href="/contacto" class="hover:text-gray-900">Contacto</a>
          <a href="/novedades" class="hover:text-gray-900">Novedades</a>
          <a href="/blog" class="hover:text-gray-900">Blog</a>
        </nav>
      </div>
    </div>
  </header>
  
</template>
<script setup lang="ts">
    import { Input } from '@/components/ui/input'
</script>