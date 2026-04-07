<script setup lang="ts">
type ContentFormatItem = {
  title: string;
  description: string;
};

type ContentFormatsData = {
  intro?: string;
  shapes: ContentFormatItem[];
  deliveryFormats: ContentFormatItem[];
};

defineProps<{
  title: string;
  data: ContentFormatsData;
}>();
</script>

<template>
  <section class="space-y-8">
    <div class="space-y-3">
      <h2 class="text-2xl font-semibold tracking-tight md:text-3xl">
        {{ title }}
      </h2>
      <p
        v-if="data.intro"
        class="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base"
      >
        {{ data.intro }}
      </p>
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
            <h4 class="text-base font-semibold">{{ item.title }}</h4>
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
            <h4 class="text-base font-semibold">{{ item.title }}</h4>
            <p class="text-sm leading-6 text-muted-foreground">
              {{ item.description }}
            </p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
