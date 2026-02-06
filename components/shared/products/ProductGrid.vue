<script lang="ts" setup>
import { computed, toRef } from "vue";
import { Card, CardContent } from "@/components/ui/card";

const props = defineProps<{ category: string }>();

const pageSize = 24;
const category = toRef(props, "category");

const { data, pending, error } = await useAsyncData(
  () => `products-grid-${category.value}`,
  () =>
    $fetch("/api/productos", {
      params: { categoria: category.value, page: 1, pageSize },
    }),
  {
    server: true,
    dedupe: "defer",
    default: () => ({ items: [], total: 0 }),
    watch: [category],
  }
);

const items = computed(() => data.value?.items ?? []);
</script>

<template>
  <section class="py-12">
    <div class="container mx-auto px-4">
      <!-- Header como en Figma -->
      <h2 class="text-[22px] leading-[28px] font-semibold text-slate-900">
        Nuestros productos
      </h2>

      <!-- States -->
      <div v-if="pending" class="py-10 text-sm text-slate-500">Cargando productos…</div>
      <div v-else-if="error" class="py-10 text-sm text-red-600">
        No se pudieron cargar los productos.
      </div>

      <!-- Grid -->
      <div v-else class="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
        <NuxtLink
          v-for="p in items"
          :key="p.path || p.slug"
          :to="p.path || `/categorias/${category}/${p.slug}`"
          class="group block"
        >
          <!-- Tarjeta -->
          <Card
            class="rounded-[14px] border-0 shadow-none bg-[#F6E7C9] overflow-hidden transition-transform duration-200 group-hover:-translate-y-[2px]"
          >
            <CardContent class="p-0">
              <!-- Área imagen (crema) -->
              <div class="px-5 pt-5 pb-4">
                <div
                  class="relative w-full aspect-[4/3] rounded-[12px] overflow-hidden bg-white/0"
                >
                  <!-- Imagen -->
                  <img
                    v-if="p.image"
                    :src="p.image"
                    :alt="p.alt || p.title"
                    class="absolute inset-0 h-full w-full object-contain"
                    loading="lazy"
                  />

                  <!-- Placeholder gris (como en tu captura) -->
                  <div v-else class="absolute inset-0 rounded-[12px] bg-[#8E8E8E]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Caption debajo (no dentro de la tarjeta) -->
          <div class="mt-2 text-[12px] leading-[16px] text-slate-700">
            {{ p.title }}
          </div>
        </NuxtLink>

        <!-- Si quieres forzar siempre 8 “huecos” como la maqueta:
             puedes renderizar placeholders extra cuando items < 8 -->
      </div>
    </div>
  </section>
</template>
