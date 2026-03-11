<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";

const props = withDefaults(
  defineProps<{
    productName: string;
    responseHoursText?: string;
    phoneDisplay?: string;
    phoneHref?: string;
    primaryCtaLabel?: string;
    primaryCtaTo?: string;
    secondaryCtaLabel?: string;
  }>(),
  {
    responseHoursText: "menos de 24 horas laborables",
    phoneDisplay: "93 274 98 90",
    phoneHref: "tel:+34932749890",
    primaryCtaLabel: "Ver más productos",
    primaryCtaTo: "/productos",
    secondaryCtaLabel: "Solicitar otro presupuesto",
  }
);

const emit = defineEmits<{
  reset: [];
}>();

const panelRef = ref<HTMLElement | null>(null);

onMounted(async () => {
  await nextTick();

  if (panelRef.value) {
    panelRef.value.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    panelRef.value.focus();
  }
});
</script>

<template>
  <section
    ref="panelRef"
    tabindex="-1"
    role="status"
    aria-live="polite"
    class="rounded-[24px] bg-[#FAF0DA] px-5 py-8 outline-none sm:px-8 sm:py-10 md:px-10 md:py-12 lg:px-12 lg:py-14"
  >
    <div class="mx-auto flex max-w-4xl flex-col items-center text-center">
      

      <p
        class="text-sm font-semibold uppercase tracking-[0.14em] text-[#1E1E1E]/65 sm:text-[15px]"
      >
        Solicitud enviada correctamente
      </p>

      <h2
        class="mt-3 max-w-[18ch] text-balance text-[30px] font-semibold leading-[1.05] tracking-[-0.03em] text-[#1E1E1E] sm:text-[38px] md:text-[46px] lg:text-[54px]"
      >
        Hemos recibido tu solicitud de presupuesto
      </h2>

      <p
        class="mt-4 max-w-[26ch] text-pretty text-[18px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#1E1E1E] sm:text-[22px] md:text-[26px] lg:text-[30px]"
      >
        {{ productName }}
      </p>

      <p
        class="mt-6 max-w-2xl text-pretty text-[16px] font-medium leading-[1.55] text-[#1E1E1E]/85 sm:mt-7 sm:text-[17px] md:text-[18px]"
      >
        ¡Gracias por confiar en nosotros! Nuestro equipo revisará los detalles de tu
        proyecto y te enviaremos una propuesta personalizada lo antes posible,
        normalmente en {{ responseHoursText }}.
      </p>

      <p
        class="mt-4 max-w-2xl text-pretty text-[16px] font-medium leading-[1.55] text-[#1E1E1E]/85 sm:text-[17px] md:text-[18px]"
      >
        Si se trata de algo urgente, puedes llamarnos directamente al
        <a
          :href="phoneHref"
          class="font-semibold text-[#1E1E1E] underline decoration-black/20 underline-offset-4 transition-opacity hover:opacity-70"
        >
          {{ phoneDisplay }}
        </a>.
      </p>

      <div
        class="mt-8 flex w-full max-w-xl flex-col gap-3 sm:mt-10 sm:flex-row sm:justify-center"
      >
        <NuxtLink
          :to="primaryCtaTo"
          class="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-[#1E1E1E] px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 sm:w-auto"
        >
          {{ primaryCtaLabel }}
        </NuxtLink>

        <button
          type="button"
          class="inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-black/10 bg-white/75 px-6 py-3 text-[15px] font-medium text-[#1E1E1E] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 sm:w-auto"
          @click="emit('reset')"
        >
          {{ secondaryCtaLabel }}
        </button>
      </div>
    </div>
  </section>
</template>