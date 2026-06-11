<!-- components/marketing/landing/LandingProblemList.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { XCircle } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    title: string;
    intro?: string;
    items?: string[];
  }>(),
  {
    intro: "",
    items: () => [],
  }
);

const safeItems = computed(() =>
  props.items.map((item) => String(item || "").trim()).filter(Boolean)
);
</script>

<template>
  <section v-if="safeItems.length" class="bg-white py-16 md:py-20">
    <div class="container-content">
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-foreground">
          {{ props.title }}
        </h2>

        <p v-if="props.intro" class="mt-4 text-base leading-7 text-foreground/70 md:text-lg">
          {{ props.intro }}
        </p>
      </div>

      <ul class="mx-auto mt-10 grid max-w-4xl gap-4 md:mt-12" role="list">
        <li
          v-for="item in safeItems"
          :key="item"
          class="flex items-start gap-4 rounded-2xl border border-border/70 bg-[hsl(var(--brand-bg-2))] px-5 py-4 shadow-sm"
        >
          <span
            class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
            aria-hidden="true"
          >
            <XCircle class="h-5 w-5" />
          </span>

          <p class="text-[15px] font-semibold leading-6 text-foreground md:text-base">
            {{ item }}
          </p>
        </li>
      </ul>
    </div>
  </section>
</template>