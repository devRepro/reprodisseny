<script setup lang="ts">
import { computed } from "vue";
import PageContainer from "@/components/layout/PageContainer.vue";

// 1. Añadimos categoryName para que el título sea dinámico
const props = defineProps<{
  query: string;
  total: number;
  categoryName?: string; // Nueva prop opcional
}>();

const emit = defineEmits<{
  "update:query": [value: string];
}>();

function onInput(event: Event) {
  emit("update:query", (event.target as HTMLInputElement).value);
}

// 2. UX: Título dinámico para que el usuario sepa dónde está
const displayTitle = computed(() => {
  if (props.query) return `Resultados para "${props.query}"`;
  return props.categoryName || "Productos";
});

// 3. UX: Mensaje de "Kicker" dinámico
const kickerText = computed(() => {
  return props.categoryName ? "Categoría" : "Catálogo de Impresión";
});
</script>

<template>
  <section
    class="catalog-section bg-slate-50/50 border-b border-slate-100 py-10 lg:py-16"
  >
    <PageContainer>
      <div class="max-w-3xl">
        <p
          class="catalog-kicker uppercase tracking-widest text-xs font-bold text-primary/60"
        >
          {{ kickerText }}
        </p>

        <h1
          class="mt-3 text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight transition-all"
        >
          {{ displayTitle }}
        </h1>

        <p v-if="!query" class="mt-4 max-w-2xl text-lg text-slate-600 leading-relaxed">
          Encuentra el soporte o formato que necesitas y solicita presupuesto en pocos
          pasos.
        </p>

        <div class="mt-8 max-w-2xl relative group">
          <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg
              class="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            :value="query"
            type="search"
            placeholder="Busca por producto, uso o material (ej: vinilo, lona...)"
            class="catalog-input w-full pl-12 pr-4 py-4 rounded-xl border-slate-200 shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
            @input="onInput"
          />
        </div>

        <p class="catalog-meta mt-4 text-sm text-slate-500 flex items-center gap-2">
          <span class="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          <strong>{{ total }}</strong>
          {{ total === 1 ? "producto encontrado" : "productos disponibles" }}
        </p>
      </div>
    </PageContainer>
  </section>
</template>

<style scoped>
/* Estilos base mantenidos pero mejorados mediante clases de utilidad */
.catalog-input::placeholder {
  color: #94a3b8;
}
</style>
