<script setup lang="ts">
import AppButton from "@/components/shared/button/AppButton.vue";
</script>

<template>
  <section class="bg-sky-100">
    <div class="mx-auto max-w-7xl px-6 py-14">
      <div class="grid grid-cols-1 gap-10 items-start lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h1 class="text-5xl leading-tight font-extrabold text-slate-900">
            Tu imprenta digital de confianza en Barcelona
          </h1>

          <p class="mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
            Convertimos tus necesidades en materiales de comunicación corporativa, comercial y marketing. Producimos tus proyectos profesionalmente, acompañándote, con calidad y rapidez.
          </p>

          <div class="mt-8">
            <AppButton to="/contacto" variant="primary" size="lg">
              Contacta con un experto
            </AppButton>
          </div>
        </div>

        <div class="flex lg:justify-end">
          <div class="relative">
            <div class="flex h-44 w-44 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg ring-1 ring-black/5">
              <img
                src="/img/logo/reprodisseny_1983.svg"
                alt="reprodisseny"
                class="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="mt-12">
        <slot />
      </div>
    </div>
  </section>
</template>