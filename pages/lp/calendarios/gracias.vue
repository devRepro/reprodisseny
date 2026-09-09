<script setup lang="ts">
import { onMounted } from "vue";
import { CheckCircle2, Mail, MapPin, Phone } from "lucide-vue-next";

import AppButton from "@/components/shared/button/AppButton.vue";
import InstagramIcon from "@/components/shared/icons/social/InstagramIcon.vue";
import LinkedinIcon from "@/components/shared/icons/social/LinkedinIcon.vue";
import {
  getCalendarQuoteThankYouTrackingContext,
  isCalendarQuoteThankYouConversion,
} from "~/utils/tracking/thankYouConversion";

definePageMeta({ layout: false });

useSeoMeta({
  title: "Solicitud recibida | Repro Disseny",
  description: "Hemos recibido tu solicitud de presupuesto para calendarios.",
  robots: "noindex,nofollow",
});

useHead({
  htmlAttrs: { lang: "es" },
  meta: [{ name: "robots", content: "noindex,nofollow" }],
});

const route = useRoute();
const tracking = useTracking();

const linkedinUrl = "https://www.linkedin.com/company/repro-disseny-s.l";
const instagramUrl = "https://www.instagram.com/reprodissenybcn/";

onMounted(() => {
  if (!isCalendarQuoteThankYouConversion(route.query)) return;

  tracking.pushPrivacySafeEvent(
    "generate_lead",
    { lead_type: "quote_request" },
    getCalendarQuoteThankYouTrackingContext(),
  );
});
</script>

<template>
  <div class="calendar-thank-you">
    <header class="calendar-thank-you__header">
      <div class="container-content calendar-thank-you__header-inner">
        <NuxtLink
          to="/"
          aria-label="Ir a la página de inicio"
          class="calendar-thank-you__brand"
        >
          <img
            src="/img/logo/reprodisseny.svg"
            alt="Logo Repro Disseny"
            width="180"
            height="40"
            decoding="async"
            draggable="false"
          />
        </NuxtLink>

        <div class="calendar-thank-you__header-actions">
          <a
            href="tel:932749890"
            class="calendar-thank-you__phone text-body-s-bold"
            aria-label="Llamar al 93 274 98 90"
          >
            <Phone aria-hidden="true" />
            <span>93 274 98 90</span>
          </a>

          <AppButton
            to="/pedir-presupuesto"
            size="sm"
            class="calendar-thank-you__header-cta"
          >
            <span class="calendar-thank-you__header-cta-full">Pide presupuesto</span>
            <span class="calendar-thank-you__header-cta-short">Presupuesto</span>
          </AppButton>
        </div>
      </div>
    </header>

    <main class="calendar-thank-you__main" aria-labelledby="calendar-thank-you-title">
      <div class="calendar-thank-you__content">
        <div class="calendar-thank-you__icon" aria-hidden="true">
          <CheckCircle2 class="calendar-thank-you__icon-mark" />
        </div>

        <h1 id="calendar-thank-you-title" class="calendar-thank-you__title section-title section-title--hero">
          Hemos recibido tu solicitud
        </h1>

        <p class="calendar-thank-you__message text-body">
          Estamos revisando toda la información, nos pondremos en contacto en cuestión de minutos.
        </p>

        <p class="calendar-thank-you__contact text-body">
          ¿Tienes dudas? Llámanos al
          <a href="tel:932749890">93 274 98 90</a>
        </p>

        <AppButton to="/productos" size="lg" class="calendar-thank-you__cta">
          DESCUBRE OTROS PRODUCTOS
        </AppButton>
      </div>
    </main>

    <footer class="calendar-thank-you__footer">
      <div class="container-content calendar-thank-you__footer-inner">
        <div class="calendar-thank-you__footer-main">
          <NuxtLink
            to="/"
            aria-label="Ir a la home de Repro Disseny"
            class="calendar-thank-you__footer-brand"
          >
            <SharedLogo variant="negative" />
          </NuxtLink>

          <nav aria-label="Redes sociales" class="calendar-thank-you__social">
            <a
              :href="linkedinUrl"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn de Reprodisseny"
              class="calendar-thank-you__social-link"
            >
              <LinkedinIcon aria-hidden="true" />
            </a>
            <a
              :href="instagramUrl"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Reprodisseny"
              class="calendar-thank-you__social-link"
            >
              <InstagramIcon aria-hidden="true" />
            </a>
          </nav>

          <address class="calendar-thank-you__contact-list text-body-s">
            <div>
              <MapPin aria-hidden="true" />
              <span>Juan de Mena 19, 08035 Barcelona</span>
            </div>
            <a href="tel:932749890">
              <Phone aria-hidden="true" />
              <span>93 274 98 90</span>
            </a>
            <a href="mailto:comercial@reprodisseny.com">
              <Mail aria-hidden="true" />
              <span>comercial@reprodisseny.com</span>
            </a>
          </address>
        </div>

        <div class="calendar-thank-you__footer-bottom text-label-s">
          <span>Copyright © Repro Disseny</span>
          <NuxtLink to="/politica-privacidad">Aviso legal</NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.calendar-thank-you {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}

.calendar-thank-you__header {
  flex: 0 0 auto;
  border-bottom: 1px solid hsl(var(--border) / 0.6);
  background: hsl(var(--background));
}

.calendar-thank-you__header-inner {
  display: flex;
  min-height: 76px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-inline: auto;
}

.calendar-thank-you__brand,
.calendar-thank-you__footer-brand {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
}

.calendar-thank-you__brand img {
  display: block;
  width: 180px;
  height: auto;
}

.calendar-thank-you__header-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 20px;
}

.calendar-thank-you__phone {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: hsl(var(--muted-foreground));
  white-space: nowrap;
}

.calendar-thank-you__phone svg {
  width: 18px;
  height: 18px;
  color: hsl(var(--primary));
}

.calendar-thank-you__header-cta-short {
  display: none;
}

.calendar-thank-you__main {
  display: flex;
  flex: 1 1 auto;
  min-height: 520px;
  align-items: center;
  justify-content: center;
  padding: 76px 20px 88px;
  background: hsl(var(--brand-base-light));
}

.calendar-thank-you__content {
  display: flex;
  width: min(100%, 760px);
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.calendar-thank-you__icon {
  display: flex;
  width: 78px;
  height: 78px;
  align-items: center;
  justify-content: center;
  border: 2px solid hsl(var(--primary));
  border-radius: 999px;
  color: hsl(var(--primary));
}

.calendar-thank-you__icon-mark {
  width: 44px;
  height: 44px;
  stroke-width: 1.5;
}

.calendar-thank-you__title {
  margin: 30px 0 0;
  color: hsl(var(--foreground));
  text-wrap: balance;
}

.calendar-thank-you__message {
  max-width: 640px;
  margin: 24px 0 0;
  color: hsl(var(--muted-foreground));
  text-wrap: pretty;
}

.calendar-thank-you__contact {
  margin: 24px 0 0;
}

.calendar-thank-you__contact a {
  color: hsl(var(--primary));
  font-weight: var(--weight-body-bold);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.calendar-thank-you__cta {
  margin-top: 32px;
  text-align: center;
}

.calendar-thank-you__footer {
  flex: 0 0 auto;
  background: hsl(var(--brand-ink-dark));
  color: #ffffff;
}

.calendar-thank-you__footer-inner {
  margin-inline: auto;
}

.calendar-thank-you__footer-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(280px, 1fr);
  min-height: 172px;
  align-items: center;
  gap: 48px;
  padding: 32px 0;
}

.calendar-thank-you__footer-brand :deep(.shared-logo) {
  width: 180px;
}

.calendar-thank-you__social {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.calendar-thank-you__social-link {
  display: inline-flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgb(255 255 255 / 28%);
  border-radius: 999px;
  color: #ffffff;
  transition: border-color 150ms ease, background-color 150ms ease;
}

.calendar-thank-you__social-link:hover {
  border-color: #ffffff;
  background: rgb(255 255 255 / 10%);
}

.calendar-thank-you__social-link :deep(svg) {
  width: 18px;
  height: 18px;
}

.calendar-thank-you__contact-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  justify-self: end;
  color: rgb(255 255 255 / 76%);
  font-style: normal;
}

.calendar-thank-you__contact-list a {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: inherit;
}

.calendar-thank-you__contact-list a:hover {
  color: #ffffff;
}

.calendar-thank-you__contact-list svg {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  color: hsl(var(--brand-base-light));
}

.calendar-thank-you__footer-bottom {
  display: flex;
  min-height: 58px;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-top: 1px solid rgb(255 255 255 / 18%);
  color: rgb(255 255 255 / 64%);
}

.calendar-thank-you__footer-bottom a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (max-width: 767px) {
  .calendar-thank-you__header-inner {
    min-height: 68px;
    gap: 12px;
  }

  .calendar-thank-you__brand img {
    width: 145px;
  }

  .calendar-thank-you__header-actions {
    gap: 10px;
  }

  .calendar-thank-you__phone {
    gap: 0;
  }

  .calendar-thank-you__phone span {
    display: none;
  }

  .calendar-thank-you__phone svg {
    width: 19px;
    height: 19px;
  }

  .calendar-thank-you__header-cta {
    min-height: 38px !important;
    padding-inline: 14px !important;
  }

  .calendar-thank-you__header-cta-full {
    display: none;
  }

  .calendar-thank-you__header-cta-short {
    display: inline;
  }

  .calendar-thank-you__main {
    min-height: 470px;
    padding: 64px 20px 72px;
  }

  .calendar-thank-you__icon {
    width: 70px;
    height: 70px;
  }

  .calendar-thank-you__icon-mark {
    width: 39px;
    height: 39px;
  }

  .calendar-thank-you__title {
    max-width: 350px;
    margin-top: 26px;
  }

  .calendar-thank-you__message {
    max-width: 350px;
    margin-top: 20px;
  }

  .calendar-thank-you__contact {
    max-width: 330px;
    margin-top: 22px;
  }

  .calendar-thank-you__cta {
    width: 100%;
    max-width: 360px;
    margin-top: 28px;
  }

  .calendar-thank-you__footer-main {
    display: flex;
    min-height: 0;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding: 34px 0 30px;
    text-align: center;
  }

  .calendar-thank-you__footer-brand :deep(.shared-logo) {
    width: 175px;
  }

  .calendar-thank-you__contact-list {
    align-items: center;
    gap: 10px;
    justify-self: auto;
  }

  .calendar-thank-you__footer-bottom {
    min-height: 64px;
    flex-wrap: wrap;
    padding: 12px 0;
    text-align: center;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .calendar-thank-you__footer-main {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 32px;
  }

  .calendar-thank-you__social {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-content: flex-start;
  }

  .calendar-thank-you__contact-list {
    grid-column: 2;
    grid-row: 1;
  }
}

@media (min-width: 1200px) {
  .calendar-thank-you__main {
    min-height: 560px;
  }
}
</style>