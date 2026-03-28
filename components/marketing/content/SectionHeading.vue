<script setup lang="ts">
import { computed, useAttrs } from "vue";

defineOptions({
  inheritAttrs: false,
});

type HeadingTag = "h1" | "h2" | "h3" | "h4";
type HeadingSize = "hero" | "section" | "compact";
type HeadingAlign = "left" | "center";
type HeadingTheme = "default" | "inverse";
type HeadingTone = "brand" | "ink" | "foreground" | "white";
type LineTone = "default" | "ink" | "foreground" | "white";

type Props = {
  as?: HeadingTag;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  size?: HeadingSize;
  align?: HeadingAlign;
  theme?: HeadingTheme;
  titleTone?: HeadingTone;
  lineTone?: LineTone;
  line?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  as: "h2",
  title: "",
  subtitle: "",
  eyebrow: "",
  size: "section",
  align: "left",
  theme: "default",
  titleTone: "brand",
  lineTone: "default",
  line: true,
});

const attrs = useAttrs();

const headingTag = computed(() => props.as);

const rootClass = computed(() => {
  return [
    "w-full",
    "space-y-3",
    props.align === "center" ? "text-center" : "text-left",
  ].join(" ");
});

const eyebrowClass = computed(() => {
  const base = "text-sm font-medium tracking-wide";
  const color = props.theme === "inverse" ? "text-white/75" : "text-primary";

  return [base, color].join(" ");
});

const rowClass = computed(() => {
  if (props.align === "center") {
    return "flex flex-col items-center gap-3";
  }

  return "flex flex-col gap-3 md:flex-row md:items-center md:gap-5";
});

const titleClass = computed(() => {
  const sizeMap: Record<HeadingSize, string> = {
    hero: "text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl",
    section: "text-2xl font-semibold leading-tight tracking-tight sm:text-3xl",
    compact: "text-xl font-semibold leading-tight tracking-tight sm:text-2xl",
  };

  const toneMap: Record<HeadingTone, string> = {
    brand: "text-primary",
    ink: "text-brand-ink-dark",
    foreground: "text-foreground",
    white: "text-white",
  };

  const colorClass = props.theme === "inverse" ? "text-white" : toneMap[props.titleTone];

  return ["m-0 text-pretty", sizeMap[props.size], colorClass].join(" ");
});

const subtitleClass = computed(() => {
  const themeMap: Record<HeadingTheme, string> = {
    default: "text-muted-foreground",
    inverse: "text-white/80",
  };

  return [
    "max-w-3xl text-sm leading-6 sm:text-base",
    props.align === "center" ? "mx-auto" : "",
    themeMap[props.theme],
  ].join(" ");
});

const lineClass = computed(() => {
  if (props.theme === "inverse") {
    return "block h-px bg-white/25";
  }

  const toneMap: Record<LineTone, string> = {
    default: "bg-border",
    ink: "bg-brand-ink-dark",
    foreground: "bg-foreground",
    white: "bg-white",
  };

  return ["block h-px", toneMap[props.lineTone]].join(" ");
});

const desktopLineClass = computed(() => {
  if (!props.line || props.align !== "left") {
    return "hidden";
  }

  return [lineClass.value, "hidden md:block md:flex-1"].join(" ");
});

const mobileLineClass = computed(() => {
  if (!props.line) {
    return "hidden";
  }

  if (props.align === "center") {
    return [lineClass.value, "mx-auto w-full max-w-xs"].join(" ");
  }

  return [lineClass.value, "w-full md:hidden"].join(" ");
});
</script>

<template>
  <div v-bind="attrs" :class="rootClass">
    <p v-if="eyebrow" :class="eyebrowClass">
      {{ eyebrow }}
    </p>

    <div :class="rowClass">
      <component :is="headingTag" :class="titleClass">
        <slot>
          {{ title }}
        </slot>
      </component>

      <span v-if="line" aria-hidden="true" :class="desktopLineClass" />
    </div>

    <span v-if="line" aria-hidden="true" :class="mobileLineClass" />

    <p v-if="subtitle" :class="subtitleClass">
      {{ subtitle }}
    </p>
  </div>
</template>
