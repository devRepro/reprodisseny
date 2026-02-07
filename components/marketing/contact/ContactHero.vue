<!-- components/marketing/contact/ContactHero.vue -->
<script setup lang="ts">
type Props = {
  title?: string;
  description?: string;
};

const props = withDefaults(defineProps<Props>(), {
  title: "Contacta con nosotros",
  description:
    "Para cualquier consulta, rellena el formulario, llámanos, envíanos un email o visita nuestras oficinas.",
});
</script>

<template>
  <!-- HERO / CLAIM (pixel-perfect) -->
  <section class="w-full bg-[#DEF4FF]">
    <div
      class="mx-auto max-w-[1440px] h-[204px] flex flex-col items-center justify-center py-[50px] gap-[24px]"
    >
      <h2
        class="w-[312px] h-[36px] text-center font-['Figtree'] font-semibold text-[30px] leading-[36px] text-[#004F78]"
      >
        {{ props.title }}
      </h2>

      <p
        class="w-[496px] h-[44px] text-center font-['Figtree'] font-normal text-[16px] leading-[22px] text-[#004F78]"
      >
        {{ props.description }}
      </p>
    </div>
  </section>
</template>
