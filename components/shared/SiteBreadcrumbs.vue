<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter, useHead, useRuntimeConfig } from "#imports";
import { ChevronDown } from "lucide-vue-next";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { useHomeCategoriesGrid } from "~/composables/useHomeCategoriesGrid";

type Crumb = { label: string; to?: string };

const props = withDefaults(
  defineProps<{
    /** Si lo pasas, NO hace auto-resolve y no dispara la carga de categorías */
    items?: Crumb[];
    /** Si no pasas items, genera crumbs desde route + categorías */
    auto?: boolean;
    /** Genera JSON-LD (BreadcrumbList) */
    jsonLd?: boolean;
    /** Clase del wrapper (controla el padding desde la página para pixel-perfect) */
    class?: string;
  }>(),
  { auto: true, jsonLd: true }
);

const route = useRoute();
const router = useRouter();
const cfg = useRuntimeConfig();

const basePath = computed(() => (router.options.history as any)?.base || "/");
const useAuto = computed(() => props.auto && (!props.items || props.items.length === 0));

// Evita fetch de categorías si no hace falta (producto)
let categoriasNav: any = null;
let pending: any = computed(() => false);
let error: any = computed(() => null);

if (useAuto.value) {
  const r = useHomeCategoriesGrid();
  categoriasNav = r.data;
  pending = r.pending;
  error = r.error;
}

const s = (v: any) => String(v ?? "").trim();

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function labelFromSegment(seg: string) {
  const m: Record<string, string> = {
    categorias: "Categorías",
    productos: "Productos",
    productes: "Productos",
  };
  return m[seg] || titleFromSlug(seg);
}

function normalizeTo(to?: string) {
  if (!to) return undefined;
  const t = s(to);
  if (!t) return undefined;

  // absolute
  if (/^https?:\/\//i.test(t)) return t;

  // relative -> ensure leading slash
  let out = t.startsWith("/") ? t : `/${t}`;

  // respect router base (deploy in subpath)
  const base = basePath.value || "/";
  if (base !== "/" && !out.startsWith(base)) {
    out = (base.replace(/\/+$/, "") + out).replace(/\/{2,}/g, "/");
  }

  // no trailing slash (except root)
  out = out.replace(/\/+$/, "") || "/";
  return out;
}

const items = computed<Crumb[]>(() => {
  // 1) Items explícitos (recomendado para producto)
  if (props.items && props.items.length) {
    const cleaned = props.items
      .map((it) => ({
        label: s(it?.label) || "—",
        to: normalizeTo(it?.to),
      }))
      .filter((it) => it.label);

    if (!cleaned.length) return [];

    // Asegura Inicio al principio
    const firstIsInicio = cleaned[0].label.toLowerCase() === "inicio";
    const inicio: Crumb = { label: "Inicio", to: normalizeTo("/") || "/" };
    const out = firstIsInicio ? cleaned : [inicio, ...cleaned];

    // Último como página activa (sin link)
    if (out.length > 1) out[out.length - 1] = { label: out[out.length - 1].label };
    return out;
  }

  // 2) Auto (categorías / rutas jerárquicas)
  const out: Crumb[] = [{ label: "Inicio", to: normalizeTo(basePath.value) }];

  if (pending.value || error.value) return out;

  const segments = route.path.split("/").filter(Boolean);
  let current = categoriasNav?.value?.menuItems ?? [];
  let acc = "";

  for (const seg of segments) {
    acc += `/${seg}`;
    const match = current.find((i: any) => i.slug === seg);
    const label = match?.nav || match?.title || labelFromSegment(seg);
    out.push({ label, to: normalizeTo(acc) });
    current = match?.children ?? [];
  }

  // Último como página activa
  if (out.length > 1) out[out.length - 1] = { label: out[out.length - 1].label };
  return out;
});

const show = computed(() => items.value.length > 1);

const siteUrl = computed(() => {
  const raw = (cfg.public as any)?.siteUrl || "https://reprodisseny.com";
  return s(raw).replace(/\/+$/, "");
});

function absUrl(to?: string) {
  const rel = normalizeTo(to) || normalizeTo(route.path) || "/";
  if (/^https?:\/\//i.test(rel)) return rel;
  return `${siteUrl.value}${rel}`.replace(/\/{2,}/g, "/").replace(":/", "://");
}

useHead(() => {
  if (!props.jsonLd || !show.value) return {};

  const itemList = items.value.map((it, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    name: it.label,
    item: absUrl(it.to),
  }));

  return {
    script: [
      {
        id: "breadcrumbs-jsonld",
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
  <div v-if="show" :class="props.class">
    <Breadcrumb>
      <BreadcrumbList class="gap-4">
        <template v-for="(it, i) in items" :key="`${it.label}-${i}`">
          <BreadcrumbItem>
            <!-- Link -->
            <template v-if="it.to && i < items.length - 1">
              <BreadcrumbLink as-child>
                <NuxtLink
                  :to="it.to"
                  class="text-[14px] leading-[20px] font-normal text-[#959595] hover:underline"
                >
                  {{ it.label }}
                </NuxtLink>
              </BreadcrumbLink>
            </template>

            <!-- Active page -->
            <template v-else>
              <BreadcrumbPage
                class="text-[14px] leading-[20px] font-normal text-[#959595]"
              >
                {{ it.label }}
              </BreadcrumbPage>
            </template>
          </BreadcrumbItem>

          <!-- Separator: chevron like Figma -->
          <BreadcrumbSeparator v-if="i < items.length - 1" class="mx-0">
            <ChevronDown class="w-[11.61px] h-[6.11px] -rotate-90 text-[#959595]" />
          </BreadcrumbSeparator>
        </template>
      </BreadcrumbList>
    </Breadcrumb>
  </div>
</template>
