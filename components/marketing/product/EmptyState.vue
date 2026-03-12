<template>
  <div class="catalog-empty">
    <h2 class="text-foreground">No hemos encontrado productos</h2>

    <p class="mx-auto mt-3 max-w-xl text-body text-[hsl(var(--muted-foreground))]">
      Prueba con otra búsqueda o elimina los filtros para ver más resultados.
    </p>

    <button
      type="button"
      class="btn-primary mt-6"
      @click="emit('clear')"
    >
      Limpiar filtros
    </button>
  </div>
</template>