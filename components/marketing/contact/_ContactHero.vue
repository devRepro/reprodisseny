<script setup lang="ts">
type Props = {
  title?: string;
  description?: string;
};

const props = withDefaults(defineProps<Props>(), {
  title: "Contáctanos",
  description:
    "Explícanos tu consulta y te responderemos lo antes posible.\nSi lo necesitas urgente, mejor llámanos.",
});
</script>

<template>
  <section class="w-full bg-brand-base-light">
    <div
      class="container-wide flex min-h-[204px] flex-col items-center justify-center gap-6 py-12 text-center md:py-14"
    >
      <h1
        class="max-w-[32rem] text-balance text-[30px] font-semibold leading-[1.2] text-brand-base-dark md:text-[34px]"
      >
        {{ props.title }}
      </h1>

      <p
        class="max-w-[31rem] whitespace-pre-line text-base leading-[1.45] text-brand-base-dark"
      >
        {{ props.description }}
      </p>
    </div>
  </section>
</template>