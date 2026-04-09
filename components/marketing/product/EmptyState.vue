<script setup lang="ts">
const emit = defineEmits<{
  clear: [];
}>();
</script>

<template>
  <section
    class="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-border/70 bg-card px-6 py-12 text-center shadow-[0_10px_30px_-24px_hsl(var(--foreground)/0.14)]"
    aria-label="Sin resultados"
  >
    <div
      class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
      aria-hidden="true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-8 w-8"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
        />
      </svg>
    </div>

    <p class="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-primary/75">
      Catálogo
    </p>

    <h2 class="mt-2 text-[28px] font-semibold leading-[1.15] text-foreground">
      No hemos encontrado resultados
    </h2>

    <p class="mt-4 max-w-[56ch] text-body leading-[1.7] text-foreground/72">
      Prueba con otra búsqueda, cambia la categoría seleccionada o limpia los filtros
      para volver a ver todo el catálogo.
    </p>

    <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        class="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-6 py-3 text-body-s-bold text-primary-foreground transition hover:opacity-90"
        @click="emit('clear')"
      >
        Limpiar filtros
      </button>

      <NuxtLink
        to="/contacto"
        class="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-background px-6 py-3 text-body-s-bold text-foreground transition hover:border-primary/25 hover:text-primary"
      >
        Solicitar ayuda
      </NuxtLink>
    </div>
  </section>
</template>