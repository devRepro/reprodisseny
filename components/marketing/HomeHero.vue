<script setup lang="ts">
import AppButton from "@/components/shared/button/AppButton.vue";
</script>

<template>
  <section class="overflow-hidden bg-sky-100">
    <div class="container-wide py-8 md:py-10 lg:py-14">
      <div
        class="grid grid-cols-1 items-start gap-8 md:gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start"
      >
        <div class="max-w-3xl">
        <p
  class="text-sm font-semibold uppercase tracking-[0.14em] text-sky-800/85 sm:text-[0.95rem] lg:text-base"
>
  Hacemos posible la comunicación gráfica
</p>

          <h1
            class="mt-3 text-balance text-4xl font-extrabold leading-[1.02] tracking-tight text-slate-900 sm:text-5xl lg:text-[clamp(3.25rem,4.2vw,4.75rem)]"
          >
            Tu imprenta digital
            <br class="hidden lg:block" />
            de confianza en Barcelona
          </h1>

          <p
            class="mt-5 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg sm:leading-8 lg:mt-6"
          >
            Convertimos tus necesidades en materiales de comunicación corporativa,
            comercial y marketing. Producimos tus proyectos profesionalmente,
            acompañándote, con calidad y rapidez.
          </p>

          <div class="mt-7 lg:mt-8">
            <AppButton
              to="/contacto"
              variant="primary"
              size="lg"
              class="w-full sm:w-auto"
            >
              Contacta con un experto
            </AppButton>
          </div>
        </div>

        <div class="hidden lg:flex lg:justify-end">
          <div
            class="flex h-44 w-44 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg ring-1 ring-black/5"
          >
            <img
              src="/img/logo/reprodisseny_1983.svg"
              alt="Reprodisseny desde 1983"
              class="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      <div class="mt-8 md:mt-10 lg:mt-12">
        <slot />
      </div>
    </div>
  </section>
</template>
