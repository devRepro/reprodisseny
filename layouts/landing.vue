<script setup lang="ts">
const brandLogo = "/img/logo/reprodisseny.svg";

function scrollToQuote() {
  if (!process.client) return;

  document.querySelector("#quote-form")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background text-foreground">
    <header
      class="sticky top-0 z-50 border-b border-border/60 bg-white/95 backdrop-blur-md"
    >
      <div class="container-wide flex min-h-16 items-center justify-between gap-4 py-3">
        <NuxtLink
          to="/"
          aria-label="Ir a la home de Repro Disseny"
          class="inline-flex shrink-0 items-center"
        >
          <img
            :src="brandLogo"
            alt="Repro Disseny"
            class="h-8 w-auto"
            width="180"
            height="40"
          />
        </NuxtLink>

        <div class="flex items-center gap-3">
          <a
            href="tel:932749890"
            class="hidden items-center text-sm font-semibold text-foreground/70 transition hover:text-primary sm:inline-flex"
          >
            93 274 98 90
          </a>

          <button
            type="button"
            class="inline-flex min-h-10 items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            @click="scrollToQuote"
          >
            Pide presupuesto
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="bg-brand-ink-dark py-10 text-white">
      <div class="container-content">
        <div class="grid gap-8 border-b border-white/10 pb-8 md:grid-cols-[1fr_auto]">
          <div>
            <NuxtLink
              to="/"
              aria-label="Ir a la home de Repro Disseny"
              class="inline-flex"
            >
              <img
                :src="brandLogo"
                alt="Repro Disseny"
                class="h-8 w-auto brightness-0 invert"
                width="180"
                height="40"
              />
            </NuxtLink>

            <p class="mt-4 max-w-sm text-sm leading-6 text-white/68">
              Impresión profesional, gran formato, PLV, vinilos, packaging y soluciones
              gráficas para empresas, retail, eventos y comunicación visual.
            </p>
          </div>

          <address class="space-y-2 text-sm not-italic text-white/72">
            <p>Juan de Mena 19, 08035 Barcelona</p>

            <p>
              <a href="tel:932749890" class="hover:text-white"> 93 274 98 90 </a>
            </p>

            <p>
              lunes a jueves 8:30-18:00<br />
              viernes 8:00-14:00
            </p>

            <p>
              <a href="mailto:comercial@reprodisseny.com" class="hover:text-white">
                comercial@reprodisseny.com
              </a>
            </p>
          </address>
        </div>

        <div
          class="flex flex-col gap-3 pt-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>Copyright © Repro Disseny</p>

          <div class="flex gap-4">
            <NuxtLink to="/politica-privacidad" class="hover:text-white"> Aviso legal </NuxtLink>

            <NuxtLink to="/politica-privacidad" class="hover:text-white">
              Privacidad
            </NuxtLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
