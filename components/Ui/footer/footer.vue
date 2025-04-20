<script setup lang="ts">
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useCategoriasNav } from "@/composables/useCategoriasNav";
import { useRouter } from "vue-router";
import { computed } from "vue";

const router = useRouter();
const { data } = await useCategoriasNav();
const categorias = computed(() => data.value?.menuItems || []);
const navigateTo = (path: string) => router.push(path);
</script>

<template>
  <footer
    class="bg-[hsl(var(--color-dark))] text-[hsl(var(--primary-foreground))]"
  >
    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Logo + RRSS -->
      <div class="flex flex-col md:flex-row items-center justify-between mb-8">
        <UiLogoFooter class="h-10 md:h-20 w-auto mb-4 md:mb-0" />
        <UiSocialMedia />
      </div>

      <Separator class="mb-8" />

      <!-- Mobile Accordion -->
      <div class="md:hidden mb-8">
        <Accordion type="single" collapsible>
          <AccordionItem value="contacto">
            <AccordionTrigger>Contacto</AccordionTrigger>
            <AccordionContent>
              <ul class="space-y-2 text-sm">
                <li>C/ Juan de Mena, 19 Barcelona</li>
                <li>
                  <a
                    href="tel:+34932749890"
                    class="block hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
                  >
                    93 274 9890
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:repro@reprodisseny.com"
                    class="block hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
                  >
                    repro@reprodisseny.com
                  </a>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="categorias">
            <AccordionTrigger>Categorías</AccordionTrigger>
            <AccordionContent>
              <ul class="space-y-2 text-sm">
                <li v-for="cat in categorias" :key="cat.slug">
                  <button
                    class="block text-left hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
                    @click="navigateTo(`/categorias/${cat.slug}`)"
                  >
                    {{ cat.nav || cat.title }}
                  </button>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="empresa">
            <AccordionTrigger>Empresa</AccordionTrigger>
            <AccordionContent>
              <ul class="space-y-2 text-sm">
                <li>
                  <button
                    class="block hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
                    @click="navigateTo('/nosotros')"
                  >
                    Sobre Nosotros
                  </button>
                </li>
                <li>
                  <button
                    class="block hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
                    @click="navigateTo('/trabaja-con-nosotros')"
                  >
                    Trabaja con Nosotros
                  </button>
                </li>
                <li>
                  <button
                    class="block hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
                    @click="navigateTo('/contacto')"
                  >
                    Contacto
                  </button>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="recursos">
            <AccordionTrigger>Recursos</AccordionTrigger>
            <AccordionContent>
              <ul class="space-y-2 text-sm">
                <li>
                  <a
                    href="/blog"
                    class="hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
                  >Blog</a>
                </li>
                <li>
                  <a
                    href="/faq"
                    class="hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
                  >FAQ</a>
                </li>
                <li>
                  <a
                    href="/mapa-web"
                    class="hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
                  >Mapa web</a>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <!-- Desktop Columns -->
      <div class="hidden md:grid grid-cols-4 gap-8 mb-8">
        <!-- Contacto -->
        <div>
          <h4 class="font-semibold mb-4">Contacto</h4>
          <ul class="space-y-2 text-sm">
            <li>C/ Gran Via, 123, Barcelona</li>
            <li>
              <a
                href="tel:+34932123456"
                class="hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
              >
                93 212 3456
              </a>
            </li>
            <li>
              <a
                href="mailto:info@reprodisseny.com"
                class="hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
              >
                info@reprodisseny.com
              </a>
            </li>
          </ul>
        </div>

        <!-- Categorías -->
        <div>
          <h4 class="font-semibold mb-4">Categorías</h4>
          <ul class="space-y-2 text-sm">
            <li v-for="cat in categorias" :key="cat.slug">
              <button
                class="hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
                @click="navigateTo(`/categorias/${cat.slug}`)"
              >
                {{ cat.nav || cat.title }}
              </button>
            </li>
          </ul>
        </div>

        <!-- Empresa -->
        <div>
          <h4 class="font-semibold mb-4">Empresa</h4>
          <ul class="space-y-2 text-sm">
            <li>
              <button
                class="hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
                @click="navigateTo('/nosotros')"
              >
                Sobre Nosotros
              </button>
            </li>
            <li>
              <button
                class="hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
                @click="navigateTo('/trabaja-con-nosotros')"
              >
                Trabaja con Nosotros
              </button>
            </li>
            <li>
              <button
                class="hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
                @click="navigateTo('/contacto')"
              >
                Contacto
              </button>
            </li>
          </ul>
        </div>

        <!-- Recursos -->
        <div>
          <h4 class="font-semibold mb-4">Recursos</h4>
          <ul class="space-y-2 text-sm">
            <li>
              <a
                href="/blog"
                class="hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
              >Blog</a>
            </li>
            <li>
              <a
                href="/faq"
                class="hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
              >FAQ</a>
            </li>
            <li>
              <a
                href="/mapa-web"
                class="hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
              >Mapa web</a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="border-t border-[hsl(var(--primary-foreground))]">
      <div
        class="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center text-xs"
      >
        <div class="flex space-x-4">
          <a
            href="/mapa-web"
            class="hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
          >Mapa web</a>
          <a
            href="/politica-privacidad"
            class="hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
          >
            Política de privacidad
          </a>
          <a
            href="/terminos"
            class="hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
          >
            Términos y condiciones
          </a>
        </div>
        <p class="mt-4 md:mt-0">
          © {{ new Date().getFullYear() }} Repro Disseny. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </footer>
</template>
