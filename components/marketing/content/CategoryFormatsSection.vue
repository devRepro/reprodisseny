<script setup lang="ts">
import ContentSectionHeader from "@/components/marketing/content/ContentSectionHeader.vue";

type ContentFormatItem = {
  title: string;
  description: string;
};

type ContentFormatsData = {
  intro?: string;
  shapes: ContentFormatItem[];
  deliveryFormats: ContentFormatItem[];
};

withDefaults(
  defineProps<{
    title: string;
    data: ContentFormatsData;
    sectionId?: string;
  }>(),
  {
    sectionId: "",
  }
);
</script>

<template>
  <section :id="sectionId" class="scroll-mt-32 space-y-8 md:space-y-10">
    <div class="max-w-3xl">
      <ContentSectionHeader
        :title="title"
        :subtitle="data.intro"
        as="h2"
      />
    </div>

    <div v-if="data.shapes?.length" class="space-y-4">
      <h3 class="text-lg font-semibold md:text-xl">Formas disponibles</h3>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="item in data.shapes"
          :key="`shape-${item.title}`"
          class="rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          <div class="space-y-3">
            <h4 class="text-base font-semibold text-foreground">{{ item.title }}</h4>
            <p class="text-sm leading-6 text-muted-foreground">
              {{ item.description }}
            </p>
          </div>
        </article>
      </div>
    </div>

    <div v-if="data.deliveryFormats?.length" class="space-y-4">
      <h3 class="text-lg font-semibold md:text-xl">Formato de entrega</h3>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="item in data.deliveryFormats"
          :key="`delivery-${item.title}`"
          class="rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          <div class="space-y-3">
            <h4 class="text-base font-semibold text-foreground">{{ item.title }}</h4>
            <p class="text-sm leading-6 text-muted-foreground">
              {{ item.description }}
            </p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>