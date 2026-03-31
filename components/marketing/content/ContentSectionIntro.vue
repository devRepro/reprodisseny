<script setup lang="ts">
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    description?: string;
    as?: "div" | "header";
    class?: string;
    eyebrowClass?: string;
    titleClass?: string;
    descriptionClass?: string;
    maxWidthClass?: string;
    spacingClass?: string;
    centered?: boolean;
  }>(),
  {
    eyebrow: "",
    description: "",
    as: "div",
    class: "",
    eyebrowClass: "",
    titleClass: "",
    descriptionClass: "",
    maxWidthClass: "max-w-3xl",
    spacingClass: "space-y-3 md:space-y-4",
    centered: false,
  }
);
</script>

<template>
  <component
    :is="props.as"
    :class="
      cn(
        props.maxWidthClass,
        props.spacingClass,
        props.centered && 'mx-auto text-center',
        props.class
      )
    "
  >
    <p
      v-if="props.eyebrow"
      :class="
        cn(
          'text-sm font-medium tracking-normal text-primary',
          props.eyebrowClass
        )
      "
    >
      {{ props.eyebrow }}
    </p>

    <h2
      :class="
        cn(
          'text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl',
          props.titleClass
        )
      "
    >
      {{ props.title }}
    </h2>

    <p
      v-if="props.description"
      :class="
        cn(
          'max-w-[62ch] text-base leading-7 text-muted-foreground md:text-lg',
          props.centered && 'mx-auto',
          props.descriptionClass
        )
      "
    >
      {{ props.description }}
    </p>
  </component>
</template>