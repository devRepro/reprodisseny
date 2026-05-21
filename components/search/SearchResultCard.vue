<script setup lang="ts">
import { computed } from "vue";
import { FolderOpen, PackageSearch } from "lucide-vue-next";

import AppButton from "@/components/shared/button/AppButton.vue";

const props = defineProps<{
  title: string;
  href: string;
  kind: "producto" | "categoria";
  image?: string | null;
  description?: string;
  eyebrow?: string;
  categoryLabel?: string;
  tags?: string[];
}>();

const eyebrowLabel = computed(() => {
  if (props.eyebrow) return props.eyebrow;
  return props.kind === "producto" ? "Producto" : "Categoría";
});

const ctaLabel = computed(() =>
  props.kind === "producto" ? "Ver producto" : "Ver categoría"
);

const Icon = computed(() =>
  props.kind === "producto" ? PackageSearch : FolderOpen
);

const visibleTags = computed(() => (props.tags ?? []).filter(Boolean).slice(0, 3));
</script>

<template>
  <article
    class="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
  >
    <NuxtLink :to="href" class="block">
      <div class="relative aspect-[16/10] overflow-hidden bg-muted/30">
        <NuxtImg
          v-if="image"
          :src="image"
          width="640"
          height="420"
          sizes="sm:100vw md:50vw xl:33vw"
          class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          :alt="title"
          loading="lazy"
        />

        <div
          v-else
          class="flex h-full w-full items-center justify-center bg-muted/40 text-muted-foreground"
        >
          <component :is="Icon" class="h-9 w-9" />
        </div>

        <div class="absolute left-4 top-4">
          <span
            class="inline-flex items-center rounded-full border border-white/50 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary shadow-sm backdrop-blur"
          >
            {{ eyebrowLabel }}
          </span>
        </div>
      </div>
    </NuxtLink>

    <div class="flex flex-1 flex-col p-5 md:p-6">
      <NuxtLink :to="href" class="group/title">
        <h3
          class="text-[20px] font-semibold leading-tight text-foreground transition group-hover/title:text-primary"
        >
          {{ title }}
        </h3>
      </NuxtLink>

      <p
        v-if="description"
        class="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground/70"
      >
        {{ description }}
      </p>

      <p
        v-if="categoryLabel"
        class="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
      >
        {{ categoryLabel }}
      </p>

      <div v-if="visibleTags.length" class="mt-4 flex flex-wrap gap-2">
        <span
          v-for="tag in visibleTags"
          :key="tag"
          class="inline-flex items-center rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-foreground/65"
        >
          {{ tag }}
        </span>
      </div>

      <div class="mt-auto pt-6">
        <AppButton :to="href" variant="outline" size="sm" arrow>
          {{ ctaLabel }}
        </AppButton>
      </div>
    </div>
  </article>
</template>