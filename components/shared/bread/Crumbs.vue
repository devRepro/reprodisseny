<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useHead, useRuntimeConfig } from "#imports";
import type { BreadcrumbItem } from "@nuxt/ui"; // 👈 Tipo de Nuxt UI
import { useCategoriasNav } from "@/composables/useCategoriasNav";

/**
 * Util: capitaliza un slug "calendarios-sobremesa" -> "Calendarios Sobremesa"
 */
function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const route = useRoute();
const router = useRouter();
const { data: categoriasNav, pending, error } = useCategoriasNav();

// Base para el primer breadcrumb ("Inicio")
const basePath = computed(() => router.options.history.base || "/");

// Construye los items para UBreadcrumb
const items = computed<BreadcrumbItem[]>(() => {
  // Inicio siempre
  const out: BreadcrumbItem[] = [{ label: "Inicio", to: basePath.value }];

  // Si no hay datos aún, devolver solo Inicio
  if (pending.value || error.value) return out;

  const segments = route.path.split("/").filter(Boolean);
  let currentLevel = categoriasNav.value?.menuItems ?? [];
  let acc = "";

  for (const seg of segments) {
    acc += `/${seg}`;
    const match = currentLevel.find((i: any) => i.slug === seg);
    const label = match?.nav || match?.title || titleFromSlug(seg);
    out.push({ label, to: acc });
    currentLevel = match?.children ?? [];
  }

  return out;
});

// Mostrar solo si hay más de 1 (Inicio + algo)
const show = computed(() => items.value.length > 1);

/**
 * JSON-LD Schema.org BreadcrumbList
 */
const siteUrl = useRuntimeConfig().public?.siteUrl || "https://reprodisseny.com";

useHead(() => {
  if (!show.value) return {};

  const itemList = items.value.map((it, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    name: it.label,
    item: `${siteUrl}${it.to}`,
  }));

  return {
    script: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: itemList,
        }),
      },
    ],
  };
});
</script>

<template>
  <div v-if="show" class="mb-4 px-4 md:px-0">
    <!-- Nuxt UI breadcrumb -->
    <UBreadcrumb :items="items" separator-icon="i-lucide-chevron-right" class="text-sm">
    </UBreadcrumb>
  </div>
</template>
