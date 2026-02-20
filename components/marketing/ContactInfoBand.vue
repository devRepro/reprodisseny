<script setup lang="ts">
type Block = { icon: string; title: string; body: string };

const props = withDefaults(
  defineProps<{
    blocks?: Block[];
    sectionClass?: string;
    containerClass?: string;
  }>(),
  {
    blocks: () => [
      {
        icon: "lucide:phone",
        title: "Atención al cliente",
        body:
          "Puedes hablar con nosotros\nlunes a jueves de 8:30h a 18:00h\nviernes de 8:00 a 14:00",
      },
      {
        icon: "lucide:mail",
        title: "Correo electrónico",
        body:
          "Si tienes cualquier duda,\nEscríbenos un email y te\nresponderemos en breve",
      },
      {
        icon: "lucide:map-pin",
        title: "Dirección postal",
        body: "Repro Disseny, SL\nC/ Juan de Mena, 19\n08035, Barcelona",
      },
    ],
    // móvil: 48px arriba/abajo | desktop: alto fijo 316 con padding 80 dentro (Figma)
    sectionClass: "py-12 md:h-[316px] md:py-20",
    containerClass: "container",
  }
);
</script>

<template>
  <section :class="['bg-brand-dark text-brand-ink-light box-border', props.sectionClass]">
    <div :class="props.containerClass">
      <div
        class="flex flex-col items-center justify-center gap-12 md:flex-row md:gap-[86px]"
      >
        <div
          v-for="b in props.blocks"
          :key="b.title"
          class="w-full max-w-sm text-center md:w-[343px] md:max-w-none"
        >
          <Icon :name="b.icon" class="mx-auto h-6 w-6 opacity-95" />

          <!-- evita h4 (te fuerza 20px). Usa tu body + semibold -->
          <div class="mt-6 text-body font-semibold">
            {{ b.title }}
          </div>

          <!-- body pequeño como en el diseño -->
          <p class="mt-4 mb-0 whitespace-pre-line text-body-s opacity-90">
            {{ b.body }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
