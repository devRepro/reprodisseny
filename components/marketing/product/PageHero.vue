<script setup lang="ts">
import PageContainer from "@/components/layout/PageContainer.vue"

defineProps<{
  query: string
  total: number
}>()

const emit = defineEmits<{
  "update:query": [value: string]
}>()

function onInput(event: Event) {
  emit("update:query", (event.target as HTMLInputElement).value)
}
</script>

<template>
  <PageContainer>
    <section class="catalog-section">
      <div class="max-w-3xl">
        <p class="catalog-kicker">Catálogo</p>

        <h1 class="mt-3 text-foreground tracking-tight">
          Productos
        </h1>

        <p class="mt-3 max-w-2xl text-body text-[hsl(var(--muted-foreground))]">
          Encuentra el soporte o formato que necesitas y solicita presupuesto en pocos pasos.
        </p>

        <div class="mt-6 max-w-2xl">
          <input
            :value="query"
            type="search"
            placeholder="Busca por producto, uso o material"
            class="catalog-input"
            @input="onInput"
          />
        </div>

        <p class="catalog-meta mt-3">
          {{ total }} productos disponibles
        </p>
      </div>
    </section>
  </PageContainer>
</template>