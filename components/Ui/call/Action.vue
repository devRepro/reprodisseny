<template>
    <section class="w-full py-16 px-4 bg-gradient-to-br from-[hsl(var(--color-primary)/.9)] to-[hsl(var(--color-secondary)/.9)] text-white">
      <div class="max-w-5xl mx-auto rounded-2xl bg-[hsl(var(--background))] shadow-xl border border-[hsl(var(--color-primary)/.2)] text-center px-6 py-12 md:px-12">
        <h2 class="text-3xl md:text-4xl font-bold mb-4 text-[hsl(var(--color-primary))]">
          ¿Listo para imprimir tus ideas?
        </h2>
        <p class="text-lg md:text-xl mb-6 text-[hsl(var(--foreground))]">
          Solicita tu presupuesto personalizado en menos de 24 horas.
        </p>
        <Button as-child class="btn-primary text-base px-6 py-3 rounded-xl">
          <NuxtLink to="/contacto">Solicitar presupuesto</NuxtLink>
        </Button>
      </div>
    </section>
  </template>
  
  <script setup>
  import { Button } from '@/components/ui/button'
  </script>