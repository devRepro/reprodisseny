<!-- components/shared/Footer.vue -->
<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { PhoneCall, Mail, MapPin, Clock, ArrowRight, ExternalLink, Facebook, Instagram, Linkedin } from "lucide-vue-next";

// shadcn-ui
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ⬇️ usa tu composable real
const { data, pending } = await useCategoriasNav({ productLimit: 0 });
const cats = computed(() => data.value?.tree ?? []); // raíces del árbol

const router = useRouter();
const navigateTo = (path?: string | null) => path && router.push(path);

// Newsletter (solo UI; conecta /api/newsletter)
const email = ref("");
const subscribing = ref(false);
const subscribeMsg = ref<null | { ok: boolean; text: string }>(null);
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function onSubscribe(e: Event) {
  e.preventDefault();
  subscribeMsg.value = null;
  if (!emailRegex.test(email.value)) {
    subscribeMsg.value = { ok: false, text: "Introduce un email válido." };
    return;
  }
  try {
    subscribing.value = true;
    // await $fetch('/api/newsletter', { method: 'POST', body: { email: email.value } })
    await new Promise((r) => setTimeout(r, 600)); // demo
    subscribeMsg.value = { ok: true, text: "¡Listo! Revisa tu email para confirmar." };
    email.value = "";
  } catch {
    subscribeMsg.value = { ok: false, text: "No hemos podido suscribirte. Inténtalo más tarde." };
  } finally {
    subscribing.value = false;
  }
}

// JSON-LD (SEO)
const orgJsonLd = computed(() => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Repro Disseny",
  url: "https://www.reprodisseny.com",
  email: "mailto:repro@reprodisseny.com",
  telephone: "+34 932 749 890",
  logo: "https://www.reprodisseny.com/logo.svg",
  sameAs: [
    "https://www.facebook.com/reprodisseny",
    "https://www.instagram.com/reprodisseny",
    "https://www.linkedin.com/company/reprodisseny",
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "C/ Juan de Mena, 19",
    addressLocality: "Barcelona",
    addressCountry: "ES",
  }
}));
</script>

<template>
  <footer
    class="relative border-t bg-[hsl(240,6%,9%)] text-[hsl(0,0%,96%)] selection:bg-white/10"
    aria-labelledby="site-footer"
  >
    <div class="pointer-events-none absolute inset-x-0 -top-16 h-16 bg-gradient-to-b from-transparent to-black/10"></div>

    <div class="max-w-7xl mx-auto px-6 py-10 md:py-14">
      <!-- Top: CTA + contacto -->
      <div class="grid md:grid-cols-[1.2fr_1fr] gap-8 items-stretch">
        <!-- CTA newsletter -->
        <section aria-label="Suscríbete a novedades" class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 md:p-6">
          <h2 id="site-footer" class="text-xl md:text-2xl font-semibold tracking-tight">
            Novedades en impresión B2B y plantillas gratis
          </h2>
          <p class="mt-2 text-sm text-white/70">
            Ofertas para calendarios 2026, guías de materiales y recursos útiles. Sin spam.
          </p>

          <form class="mt-4 flex flex-col sm:flex-row gap-3" @submit="onSubscribe">
            <Input
              v-model="email"
              type="email"
              inputmode="email"
              autocomplete="email"
              placeholder="tu@email.com"
              class="h-11 bg-white text-black placeholder:text-black/50 focus-visible:ring-2"
              aria-label="Introduce tu email para suscripción"
              :aria-invalid="!!subscribeMsg && !subscribeMsg.ok"
            />
            <Button :disabled="subscribing" class="h-11 px-5 font-medium">
              <ArrowRight class="mr-2 h-4 w-4" />
              {{ subscribing ? 'Enviando…' : 'Suscribirme' }}
            </Button>
          </form>

          <p
            v-if="subscribeMsg"
            class="mt-2 text-sm"
            :class="subscribeMsg.ok ? 'text-emerald-300' : 'text-red-300'"
            role="status"
          >
            {{ subscribeMsg.text }}
          </p>

          <!-- Quick-intent -->
          <div class="mt-4 flex flex-wrap gap-3 text-sm">
            <button
              class="rounded-full border border-white/15 px-3 py-1 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              @click="navigateTo('/contacto')"
            >
              Presupuesto en 24h
            </button>
            <button
              class="rounded-full border border-white/15 px-3 py-1 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              @click="navigateTo('/calendarios')"
            >
              Calendarios personalizados
            </button>
            <button
              class="rounded-full border border-white/15 px-3 py-1 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              @click="navigateTo('/plantillas')"
            >
              Plantillas (AI/PDF)
            </button>
          </div>
        </section>

        <!-- Contacto + RRSS -->
        <aside class="rounded-2xl border border-white/10 bg-white/0 p-5">
          <ul class="space-y-3 text-sm">
            <li class="flex items-start gap-3">
              <PhoneCall class="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p class="text-white/80">Llámanos</p>
                <a href="tel:+34932749890" class="font-medium hover:underline">93 274 9890</a>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <Mail class="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p class="text-white/80">Escríbenos</p>
                <a href="mailto:repro@reprodisseny.com" class="font-medium hover:underline">repro@reprodisseny.com</a>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <MapPin class="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p class="text-white/80">Visítanos</p>
                <a href="https://maps.google.com/?q=Repro+Disseny+Juan+de+Mena+19+Barcelona" target="_blank" rel="noopener" class="inline-flex items-center gap-1 font-medium hover:underline">
                  C/ Juan de Mena, 19, Barcelona <ExternalLink class="h-3.5 w-3.5" />
                </a>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <Clock class="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p class="text-white/80">Horario</p>
                <p class="font-medium">L-V 9:00–18:00</p>
              </div>
            </li>
          </ul>

          <!-- RRSS -->
          <div class="mt-5 flex items-center gap-4">
            <a href="https://www.facebook.com/reprodisseny" target="_blank" rel="noopener" aria-label="Facebook" class="rounded-full p-2 border border-white/15 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/30">
              <Facebook class="h-5 w-5" />
            </a>
            <a href="https://www.instagram.com/reprodisseny" target="_blank" rel="noopener" aria-label="Instagram" class="rounded-full p-2 border border-white/15 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/30">
              <Instagram class="h-5 w-5" />
            </a>
            <a href="https://www.linkedin.com/company/reprodisseny" target="_blank" rel="noopener" aria-label="LinkedIn" class="rounded-full p-2 border border-white/15 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/30">
              <Linkedin class="h-5 w-5" />
            </a>
          </div>
        </aside>
      </div>

      <Separator class="my-8 bg-white/10" />

      <!-- Navegación: acordeón móvil + columnas desktop -->
      <div class="md:hidden">
        <Accordion type="multiple" class="w-full">
          <AccordionItem value="categorias">
            <AccordionTrigger>Categorías</AccordionTrigger>
            <AccordionContent>
              <ul class="space-y-2 text-sm">
                <li v-if="pending" class="text-white/60">Cargando…</li>
                <li v-else v-for="cat in cats" :key="cat.slug || cat.id">
                  <button
                    class="block w-full text-left hover:underline focus-visible:underline"
                    @click="navigateTo(cat.path || `/categorias/${cat.slug}`)"
                  >
                    {{ cat.nav || cat.title || cat.slug }}
                  </button>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="empresa">
            <AccordionTrigger>Empresa</AccordionTrigger>
            <AccordionContent>
              <ul class="space-y-2 text-sm">
                <li><button class="hover:underline" @click="navigateTo('/nosotros')">Sobre Nosotros</button></li>
                <li><button class="hover:underline" @click="navigateTo('/trabaja-con-nosotros')">Trabaja con Nosotros</button></li>
                <li><button class="hover:underline" @click="navigateTo('/contacto')">Contacto</button></li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="recursos">
            <AccordionTrigger>Recursos</AccordionTrigger>
            <AccordionContent>
              <ul class="space-y-2 text-sm">
                <li><a href="/blog" class="hover:underline">Blog</a></li>
                <li><a href="/faq" class="hover:underline">FAQ</a></li>
                <li><a href="/mapa-web" class="hover:underline">Mapa web</a></li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div class="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8">
        <nav aria-label="Categorías">
          <h3 class="font-semibold mb-4 tracking-tight">Categorías</h3>
          <ul class="space-y-2 text-sm">
            <li v-if="pending" class="text-white/60">Cargando…</li>
            <li v-else v-for="cat in cats" :key="cat.slug || cat.id">
              <button class="hover:underline hover:text-white" @click="navigateTo(cat.path || `/categorias/${cat.slug}`)">
                {{ cat.nav || cat.title || cat.slug }}
              </button>
            </li>
          </ul>
        </nav>

        <nav aria-label="Empresa">
          <h3 class="font-semibold mb-4 tracking-tight">Empresa</h3>
          <ul class="space-y-2 text-sm">
            <li><button class="hover:underline" @click="navigateTo('/nosotros')">Sobre Nosotros</button></li>
            <li><button class="hover:underline" @click="navigateTo('/trabaja-con-nosotros')">Trabaja con Nosotros</button></li>
            <li><button class="hover:underline" @click="navigateTo('/contacto')">Contacto</button></li>
          </ul>
        </nav>

        <nav aria-label="Recursos">
          <h3 class="font-semibold mb-4 tracking-tight">Recursos</h3>
          <ul class="space-y-2 text-sm">
            <li><a href="/blog" class="hover:underline">Blog</a></li>
            <li><a href="/faq" class="hover:underline">FAQ</a></li>
            <li><a href="/mapa-web" class="hover:underline">Mapa web</a></li>
          </ul>
        </nav>

        <section aria-label="Calidad y pagos">
          <h3 class="font-semibold mb-4 tracking-tight">Confianza</h3>
          <div class="grid grid-cols-3 gap-3">
            <div class="rounded-lg border border-white/10 bg-white/5 p-3 text-center text-xs">ISO 9001</div>
            <div class="rounded-lg border border-white/10 bg-white/5 p-3 text-center text-xs">Pago seguro</div>
            <div class="rounded-lg border border-white/10 bg-white/5 p-3 text-center text-xs">Entrega 24–48h</div>
          </div>
        </section>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="border-t border-white/10">
      <div class="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/70">
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
          <a href="/mapa-web" class="hover:underline">Mapa web</a>
          <a href="/politica-privacidad" class="hover:underline">Privacidad</a>
          <a href="/terminos" class="hover:underline">Términos</a>
          <a href="/cookies" class="hover:underline">Cookies</a>
        </div>
        <p class="text-center">© {{ new Date().getFullYear() }} Repro Disseny. Todos los derechos reservados.</p>
      </div>
    </div>

    
  </footer>
</template>

<style scoped>
:focus-visible { outline: none; }
</style>
