<script setup lang="ts">
type Props = {
  title: string;
  description?: string;
  as?: "h1" | "h2";
  size?: "default" | "compact";
};

const props = withDefaults(defineProps<Props>(), {
  description: "",
  as: "h1",
  size: "default",
});
</script>

<template>
  <section class="w-full border-b border-border/40 bg-brand-base-light">
    <div
      class="container-wide flex flex-col items-center justify-center text-center"
      :class="
        props.size === 'compact'
          ? 'min-h-[168px] gap-4 py-10 md:min-h-[184px] md:py-12'
          : 'min-h-[196px] gap-5 py-12 md:min-h-[220px] md:gap-6 md:py-14'
      "
    >
      <component
        :is="props.as"
        class="max-w-3xl text-balance font-semibold tracking-tight text-brand-base-dark"
        :class="
          props.size === 'compact'
            ? 'text-[28px] leading-[1.15] md:text-[32px]'
            : 'text-[30px] leading-[1.12] md:text-[38px]'
        "
      >
        {{ props.title }}
      </component>

      <p
        v-if="props.description"
        class="max-w-2xl whitespace-pre-line text-pretty text-[16px] leading-7 text-brand-base-dark/90"
      >
        {{ props.description }}
      </p>
    </div>
  </section>
</template>