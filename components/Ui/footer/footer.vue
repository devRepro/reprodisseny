<script setup lang="ts">
<<<<<<< Updated upstream
import { Separator } from "@/components/ui/separator";
=======
import { Separator } from '@/components/ui/separator'
>>>>>>> Stashed changes
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
<<<<<<< Updated upstream
} from "@/components/ui/accordion";
import { useCategoriasNav } from "@/composables/useCategoriasNav";
import { useRouter } from "vue-router";
import { computed } from "vue";
import { PhoneCall, Mail } from "lucide-vue-next";

// Router para navegación interna
const router = useRouter();
const { data } = await useCategoriasNav();
const categorias = computed(() => data.value?.menuItems || []);
const navigateTo = (path: string) => router.push(path);
=======
} from '@/components/ui/accordion'
import { useCategoriasNav } from '@/composables/useCategoriasNav'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const router = useRouter()
const { data } = await useCategoriasNav()
const categorias = computed(() => data.value?.menuItems || [])
const navigateTo = (path: string) => router.push(path)
>>>>>>> Stashed changes
</script>

<template>
  <footer class="bg-[hsl(var(--color-dark))] text-[hsl(var(--primary-foreground))]">
    <div class="max-w-7xl mx-auto px-6 py-8">
<<<<<<< Updated upstream
      <!-- Logo + Redes Sociales -->
      <div class="flex flex-col md:flex-row items-center justify-between mb-8">
        <UiLogoFooter class="h-10 md:h-20 w-auto mb-4 md:mb-0" />
=======
      <!-- Logo + RRSS -->
      <div class="flex flex-col md:flex-row items-center justify-between mb-8">
        <UiLogoFooter class="h-10 w-auto mb-4 md:mb-0" aria-label="Repro Disseny" />
>>>>>>> Stashed changes
        <UiSocialMedia />
      </div>

      <Separator class="mb-8" />

      <!-- Mobile Accordion -->
      <div class="md:hidden mb-8">
        <Accordion type="single" collapsible>
<<<<<<< Updated upstream
          <!-- Contacto -->
=======
>>>>>>> Stashed changes
          <AccordionItem value="contacto">
            <AccordionTrigger>Contacto</AccordionTrigger>
            <AccordionContent>
              <ul class="space-y-2 text-sm">
<<<<<<< Updated upstream
                <li>Juan de Mena 19, 08035 Barcelona</li>
                <li>
                  <a
                    href="tel:+34932749890"
                    class="flex items-center hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
                  >
                    <PhoneCall class="w-4 h-4 mr-2 flex-shrink-0" />
                    +34 93 274 98 90
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:comercial@reprodisseny.com"
                    class="flex items-center hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
                  >
                    <Mail class="w-4 h-4 mr-2 flex-shrink-0" />
                    comercial@reprodisseny.com
=======
                <li>C/ Gran Via, 123, Barcelona</li>
                <li>
                  <a href="tel:+34932123456"
                     class="block hover:underline hover:text-[hsl(var(--color-accent))]">
                    93 212 3456
                  </a>
                </li>
                <li>
                  <a href="mailto:info@reprodisseny.com"
                     class="block hover:underline hover:text-[hsl(var(--color-accent))]">
                    info@reprodisseny.com
>>>>>>> Stashed changes
                  </a>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

<<<<<<< Updated upstream
          <!-- Categorías -->
=======
>>>>>>> Stashed changes
          <AccordionItem value="categorias">
            <AccordionTrigger>Categorías</AccordionTrigger>
            <AccordionContent>
              <ul class="space-y-2 text-sm">
                <li v-for="cat in categorias" :key="cat.slug">
                  <button
<<<<<<< Updated upstream
                    class="block text-left hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
=======
                    class="block text-left hover:underline hover:text-[hsl(var(--color-accent))]"
>>>>>>> Stashed changes
                    @click="navigateTo(`/categorias/${cat.slug}`)"
                  >
                    {{ cat.nav || cat.title }}
                  </button>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

<<<<<<< Updated upstream
          <!-- Empresa -->
=======
>>>>>>> Stashed changes
          <AccordionItem value="empresa">
            <AccordionTrigger>Empresa</AccordionTrigger>
            <AccordionContent>
              <ul class="space-y-2 text-sm">
                <li>
                  <button
<<<<<<< Updated upstream
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
=======
                    class="block hover:underline hover:text-[hsl(var(--color-accent))]"
                    @click="navigateTo('/nosotros')"
                  >Sobre Nosotros</button>
                </li>
                <li>
                  <button
                    class="block hover:underline hover:text-[hsl(var(--color-accent))]"
                    @click="navigateTo('/trabaja-con-nosotros')"
                  >Trabaja con Nosotros</button>
                </li>
                <li>
                  <button
                    class="block hover:underline hover:text-[hsl(var(--color-accent))]"
                    @click="navigateTo('/contacto')"
                  >Contacto</button>
>>>>>>> Stashed changes
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

<<<<<<< Updated upstream
          <!-- Recursos -->
=======
>>>>>>> Stashed changes
          <AccordionItem value="recursos">
            <AccordionTrigger>Recursos</AccordionTrigger>
            <AccordionContent>
              <ul class="space-y-2 text-sm">
<<<<<<< Updated upstream
                <li>
                  <a
                    href="/blog"
                    class="hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="/faq"
                    class="hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="/mapa-web"
                    class="hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
                  >
                    Mapa web
                  </a>
                </li>
=======
                <li><a href="/blog" class="hover:underline hover:text-[hsl(var(--color-accent))]">Blog</a></li>
                <li><a href="/faq" class="hover:underline hover:text-[hsl(var(--color-accent))]">FAQ</a></li>
                <li><a href="/mapa-web" class="hover:underline hover:text-[hsl(var(--color-accent))]">Mapa web</a></li>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
            <li>Juan de Mena 19, 08035 Barcelona</li>
            <li>
              <a
                href="tel:+34932749890"
                class="flex items-center hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
              >
                <PhoneCall class="w-4 h-4 mr-2 flex-shrink-0" />
                +34 93 274 98 90
              </a>
            </li>
            <li>
              <a
                href="mailto:comercial@reprodisseny.com"
                class="flex items-center hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
              >
                <Mail class="w-4 h-4 mr-2 flex-shrink-0" />
                comercial@reprodisseny.com
=======
            <li>C/ Gran Via, 123, Barcelona</li>
            <li>
              <a href="tel:+34932123456"
                 class="hover:underline hover:text-[hsl(var(--color-accent))]">
                93 212 3456
              </a>
            </li>
            <li>
              <a href="mailto:info@reprodisseny.com"
                 class="hover:underline hover:text-[hsl(var(--color-accent))]">
                info@reprodisseny.com
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                class="hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
=======
                class="hover:underline hover:text-[hsl(var(--color-accent))]"
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
              >
                Blog
              </a>
            </li>
            <li>
              <a
                href="/faq"
                class="hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
              >
                FAQ
              </a>
            </li>
            <li>
              <a
                href="/mapa-web"
                class="hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
              >
                Mapa web
              </a>
=======
                class="hover:underline hover:text-[hsl(var(--color-accent))]"
                @click="navigateTo('/nosotros')"
              >Sobre Nosotros</button>
            </li>
            <li>
              <button
                class="hover:underline hover:text-[hsl(var(--color-accent))]"
                @click="navigateTo('/trabaja-con-nosotros')"
              >Trabaja con Nosotros</button>
            </li>
            <li>
              <button
                class="hover:underline hover:text-[hsl(var(--color-accent))]"
                @click="navigateTo('/contacto')"
              >Contacto</button>
>>>>>>> Stashed changes
            </li>
          </ul>
        </div>

        <!-- Recursos -->
        <div>
          <h4 class="font-semibold mb-4">Recursos</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="/blog" class="hover:underline hover:text-[hsl(var(--color-accent))]">Blog</a></li>
            <li><a href="/faq" class="hover:underline hover:text-[hsl(var(--color-accent))]">FAQ</a></li>
            <li><a href="/mapa-web" class="hover:underline hover:text-[hsl(var(--color-accent))]">Mapa web</a></li>
          </ul>
        </div>
      </div>

    </div>

<<<<<<< Updated upstream
    <!-- Bottom Bar -->
    <div class="border-t border-[hsl(var(--primary-foreground))]">
      <div class="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center text-xs">
        <div class="flex space-x-4">
          <a
            href="/mapa-web"
            class="hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
          >Mapa web</a>
          <a
            href="/aviso-legal"
            class="hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
          >Aviso legal</a>
          <a
            href="/privacidad"
            class="hover:underline hover:decoration-[hsl(var(--color-accent))] hover:decoration-2 hover:underline-offset-2 transition"
          >Política de privacidad</a>
        </div>
        <p class="mt-4 md:mt-0">© {{ new Date().getFullYear() }} Repro Disseny. Todos los derechos reservados.</p>
=======
    <!-- Bottom bar -->
    <div class="border-t border-[hsl(var(--primary-foreground))]">
      <div class="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center text-xs">
        <div class="flex space-x-4">
          <a href="/mapa-web" class="hover:underline hover:text-[hsl(var(--color-accent))]">Mapa web</a>
          <a href="/politica-privacidad" class="hover:underline hover:text-[hsl(var(--color-accent))]">Política de privacidad</a>
          <a href="/terminos" class="hover:underline hover:text-[hsl(var(--color-accent))]">Términos y condiciones</a>
        </div>
        <p class="mt-4 md:mt-0">© {{ new Date().getFullYear() }} Repro Disseny. Todos los derechos reservados.</p>
>>>>>>> Stashed changes
      </div>
    </div>
  </footer>
</template>
<<<<<<< Updated upstream

<style scoped>
/* Estilos adicionales si es necesario */
</style>
=======
>>>>>>> Stashed changes
