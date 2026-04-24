<script setup lang="ts">
import AppButton from "@/components/shared/button/AppButton.vue";
</script>

<template>
  <section
    class="relative overflow-hidden border-b border-primary/10 bg-[linear-gradient(135deg,hsl(var(--brand-base-light))_0%,hsl(var(--primary)/0.18)_52%,hsl(var(--primary)/0.26)_100%)] text-foreground"
  >
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        class="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-background/45 blur-3xl"
      />
      <div
        class="absolute right-[-9rem] top-8 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        class="absolute bottom-[-11rem] left-1/3 h-80 w-80 rounded-full bg-primary/16 blur-3xl"
      />
      <div
        class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/25 to-transparent"
      />
    </div>

    <div class="container-wide relative py-8 md:py-10 lg:py-14">
      <div
        class="grid grid-cols-1 items-start gap-8 md:gap-10 lg:grid-cols-[1.2fr_0.8fr]"
      >
        <div class="max-w-3xl">
          <p class="section-eyebrow">
            Hacemos posible la comunicación gráfica
          </p>

          <h1
            class="mt-3 text-balance text-[clamp(2.5rem,9vw,4.75rem)] font-extrabold leading-[1.02] tracking-tight text-foreground"
          >
            Tu imprenta digital
            <br class="hidden lg:block" />
            de confianza en Barcelona
          </h1>

          <p
            class="mt-5 max-w-2xl text-body leading-7 text-foreground/75 sm:text-lg sm:leading-8 lg:mt-6"
          >
            Convertimos tus necesidades en materiales de comunicación
            corporativa, comercial y marketing. Producimos tus proyectos
            profesionalmente, acompañándote, con calidad y rapidez.
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
            class="relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-full border border-primary/10 bg-background/85 shadow-[0_18px_45px_-28px_hsl(var(--foreground)/0.35)] ring-1 ring-background/70"
          >
            <img
              src="/img/logo/reprodisseny_1983.svg"
              alt="Reprodisseny desde 1983"
              class="h-full w-full object-cover"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      </div>

      <div class="relative mt-8 md:mt-10 lg:mt-12">
        <slot />
      </div>
    </div>
  </section>
</template>