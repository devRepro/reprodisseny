<script setup lang="ts">
import ContentSectionHeader from "@/components/marketing/content/ContentSectionHeader.vue";

type CategoryTypeItem = {
  title: string;
  description: string;
  features?: string[];
  idealFor?: string;
};

withDefaults(
  defineProps<{
    title?: string;
    intro?: string;
    items?: CategoryTypeItem[];
    sectionId?: string;
  }>(),
  {
    title: "Tipos",
    intro: "",
    items: () => [],
    sectionId: "",
  }
);
</script>

<template>
  <section
    v-if="items?.length"
    :id="sectionId"
    class="scroll-mt-32 space-y-8 md:space-y-10"
  >
    <div class="max-w-3xl">
      <ContentSectionHeader
        :title="title || 'Tipos'"
        :subtitle="intro"
        as="h2"
      />
    </div>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="item in items"
        :key="item.title"
        class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
      >
        <div
          class="absolute inset-x-0 top-0 h-1 bg-primary/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        <div class="flex flex-1 flex-col space-y-4">
          <div class="space-y-2">
            <h3
              class="text-xl font-semibold leading-tight text-foreground transition-colors group-hover:text-primary"
            >
              {{ item.title }}
            </h3>
            <p class="text-sm leading-relaxed text-muted-foreground">
              {{ item.description }}
            </p>
          </div>

          <div v-if="item.features?.length" class="mt-auto flex flex-wrap gap-2 pt-2">
            <span
              v-for="feature in item.features"
              :key="feature"
              class="inline-flex items-center rounded-md border border-primary/15 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
            >
              {{ feature }}
            </span>
          </div>
        </div>

        <div
          v-if="item.idealFor"
          class="mt-6 rounded-xl bg-muted/30 p-4 text-sm"
        >
          <span class="mb-1 block font-semibold text-foreground">Ideal para:</span>
          <span class="leading-relaxed text-muted-foreground">{{ item.idealFor }}</span>
        </div>
      </article>
    </div>
  </section>
</template>