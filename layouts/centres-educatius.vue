<script setup lang="ts">
import { Phone } from "lucide-vue-next";

const brandLogo = "/img/logo/reprodisseny.svg";

function scrollToQuote() {
  if (!import.meta.client) return;

  document.querySelector("#quote-form, #pressupost-centres-educatius")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}
</script>

<template>
  <div class="lp-shell flex min-h-screen flex-col bg-background text-foreground">
    <header
          class="sticky top-0 z-50 border-b border-border/60 bg-white/95 backdrop-blur-md"
        >
          <div
            class="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 md:h-20 md:gap-6 md:px-10 lg:px-16 2xl:px-[120px]"
          >
            <NuxtLink
              to="/"
              aria-label="Ir a la página de inicio"
              class="flex min-w-0 shrink-0 items-center"
            >
              <div class="flex min-w-0 items-center gap-3">
                <img
                  :src="brandLogo"
                  alt="Logo Repro Disseny, imprenta digital, impresión óffset y gran formato"
                  class="block h-7 w-auto md:h-9 lg:h-10"
                  width="180"
                  height="40"
                  decoding="async"
                  draggable="false"
                />
    
                <span class="sr-only">Repro Disseny Inicio</span>
              </div>
            </NuxtLink>
    
            <div class="flex shrink-0 items-center gap-1.5 md:gap-3">
              <a
                href="tel:+34932749890"
                class="hidden items-center gap-2 p-2 text-slate-400 transition-colors hover:text-sky-700 sm:flex"
                aria-label="Llamar a atención al cliente"
              >
                <Phone class="h-5 w-5 md:h-4 md:w-4" />
    
                <span class="hidden whitespace-nowrap text-[14px] font-medium xl:inline">
                  +34 932 749 890
                </span>
              </a>
    
              <button
                type="button"
                class="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-transparent bg-primary px-2.5 py-2 text-[12px] font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-3 sm:text-[13px] md:h-11 md:px-6 md:text-[14px]"
                @click="scrollToQuote"
              >
                <span class="hidden text-sm sm:inline">Demana pressupost</span>
                <span class="text-xs sm:hidden">Pressupost</span>
              </button>
            </div>
          </div>
        </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="bg-brand-ink-dark py-10 text-white">
      <div class="lp-frame">
        <div class="grid gap-8 border-b border-white/10 pb-8 md:grid-cols-[1fr_auto]">
          <div>
            <NuxtLink to="/" aria-label="Ir a la home de Repro Disseny" class="inline-flex">
              <img
                :src="brandLogo"
                alt="Repro Disseny"
                class="h-8 w-auto brightness-0 invert"
                width="180"
                height="40"
              />
            </NuxtLink>

            <p class="mt-4 max-w-sm text-sm leading-6 text-white/68">
  Impressió professional, material didàctic, dossiers, quaderns,
  senyalística, vinils i solucions gràfiques per a centres educatius.
</p>
          </div>

          <address class="space-y-2 text-sm not-italic text-white/72">
            <p>Juan de Mena 19, 08035 Barcelona</p>
            <p><a href="tel:+34932749890" class="hover:text-white">93 274 98 90</a></p>
            <p>dilluns a dijous 8:30-18:00<br />divendres 8:00-14:00</p>
            <p>
              <a href="mailto:comercial@reprodisseny.com" class="hover:text-white">
                comercial@reprodisseny.com
              </a>
            </p>
          </address>
        </div>

        <div class="flex flex-col gap-3 pt-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright © Repro Disseny</p>

          <div class="flex gap-4">
            <NuxtLink to="/politica-privacidad" class="hover:text-white">Aviso legal</NuxtLink>
            <NuxtLink to="/politica-privacidad" class="hover:text-white">Privacidad</NuxtLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.lp-shell {
  --lp-frame: 1441px;
  --lp-pad-left: 220px;
  --lp-pad-right: 210px;
}

.lp-frame {
  width: 100%;
  max-width: var(--lp-frame);
  margin-inline: auto;
  padding-left: var(--lp-pad-left);
  padding-right: var(--lp-pad-right);
}

.lp-header {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid hsl(var(--border) / 0.6);
  background: rgb(255 255 255 / 0.95);
  backdrop-filter: blur(12px);
}

.lp-header__inner {
  display: flex;
  height: 130px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding-top: 40px;
  padding-bottom: 40px;
}

.lp-header__logo {
  display: block;
  width: auto;
  height: 50px;
}

.lp-header__actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 22px;
}

.lp-header__phone {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #8da0b4;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  text-decoration: none;
  transition: color 160ms ease;
}

.lp-header__phone:hover {
  color: hsl(var(--brand-base));
}

.lp-header__phone-icon {
  width: 14px;
  height: 14px;
}

.lp-header__cta {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 12px;
  background: hsl(var(--brand-base));
  padding: 0 22px;
  color: hsl(var(--brand-white));
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    transform 160ms ease;
}

.lp-header__cta:hover {
  background: hsl(var(--brand-base-dark));
  transform: translateY(-1px);
}

@media (max-width: 1200px) {
  .lp-shell {
    --lp-pad-left: 80px;
    --lp-pad-right: 80px;
  }
}

@media (max-width: 767px) {
  .lp-shell {
    --lp-pad-left: 16px;
    --lp-pad-right: 16px;
  }

  .lp-header__inner {
    height: 64px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .lp-header__logo {
    height: 34px;
  }

  .lp-header__phone {
    display: none;
  }

  .lp-header__cta {
    min-height: 32px;
    border-radius: 10px;
    padding-inline: 14px;
    font-size: 11px;
  }
}
</style>