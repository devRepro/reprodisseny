<script setup lang="ts">
import { Separator } from '@/components/ui/separator'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { useCategoriasNav } from '@/composables/useCategoriasNav'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { PhoneCall, Mail } from 'lucide-vue-next'

const router = useRouter()
const { data } = await useCategoriasNav()
const categorias = computed(() => data.value?.menuItems || [])
const navigateTo = (path: string) => router.push(path)
</script>

<template>
  <footer class="bg-gradient-to-b from-[hsl(240,5%,20%)] to-[hsl(240,5%,15%)] text-[hsl(var(--primary-foreground))]">
    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Logo + RRSS -->
      <div class="flex flex-col md:flex-row items-center justify-between mb-8">
        <UiLogoImgFooter class="h-32 w-auto mb-4 md:mb-0" />
        <UiSocialMedia />
      </div>

      <!-- Separador -->
      <Separator class="mb-8 bg-[hsl(var(--primary-foreground)/20%)]"  />

      <!-- Accordion móvil -->
      <div class="md:hidden mb-8">
        <Accordion type="single" collapsible>
          <!-- Contacto -->
          <AccordionItem value="contacto">
            <AccordionTrigger>Contacto</AccordionTrigger>
            <AccordionContent>
              <ul class="space-y-2 text-sm">
                <li class="flex items-center">
                  <PhoneCall class="w-4 h-4 mr-2 flex-shrink-0" />
                  <a href="tel:+34932749890" class="hover:underline hover:text-[hsl(var(--color-accent))]">
                    93 274 9890
                  </a>
                </li>
                <li class="flex items-center">
                  <Mail class="w-4 h-4 mr-2 flex-shrink-0" />
                  <a href="mailto:repro@reprodisseny.com" class="hover:underline hover:text-[hsl(var(--color-accent))]">
                    repro@reprodisseny.com
                  </a>
                </li>
                <li>
                  <p class="text-sm">C/ Juan de Mena, 19, Barcelona</p>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <!-- Categorías -->
          <AccordionItem value="categorias">
            <AccordionTrigger>Categorías</AccordionTrigger>
            <AccordionContent>
              <ul class="space-y-2 text-sm">
                <li v-for="cat in categorias" :key="cat.slug">
                  <button
                    class="block w-full text-left hover:underline hover:text-foreground/80 focus-visible:underline focus-visible:text-foreground/80 transition-colors duration-200"
                    @click="navigateTo(`/categorias/${cat.slug}`)"
                  >
                    {{ cat.nav || cat.title }}
                  </button>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <!-- Empresa -->
          <AccordionItem value="empresa">
            <AccordionTrigger>Empresa</AccordionTrigger>
            <AccordionContent>
              <ul class="space-y-2 text-sm">
                <li>
                  <button
                    class="block hover:underline hover:text-foreground/80 focus-visible:underline focus-visible:text-foreground/80 transition-colors duration-200"
                    @click="navigateTo('/nosotros')"
                  >
                    Sobre Nosotros
                  </button>
                </li>
                <li>
                  <button
                    class="block hover:underline hover:text-[hsl(var(--color-accent))]"
                    @click="navigateTo('/trabaja-con-nosotros')"
                  >
                    Trabaja con Nosotros
                  </button>
                </li>
                <li>
                  <button
                    class="block hover:underline hover:text-[hsl(var(--color-accent))]"
                    @click="navigateTo('/contacto')"
                  >
                    Contacto
                  </button>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <!-- Recursos -->
          <AccordionItem value="recursos">
            <AccordionTrigger>Recursos</AccordionTrigger>
            <AccordionContent>
              <ul class="space-y-2 text-sm">
                <li><a href="/blog" class="hover:underline hover:text-[hsl(var(--color-accent))]">Blog</a></li>
                <li><a href="/faq" class="hover:underline hover:text-[hsl(var(--color-accent))]">FAQ</a></li>
                <li><a href="/mapa-web" class="hover:underline hover:text-[hsl(var(--color-accent))]">Mapa web</a></li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <!-- Columnas escritorio -->
      <div class="hidden md:grid grid-cols-4 gap-8 mb-8">
        <!-- Contacto -->
        <div>
          <h4 class="font-semibold mb-4">Contacto</h4>
          <ul class="space-y-2 text-sm">
            <li class="flex items-center">
              <PhoneCall class="w-4 h-4 mr-2 flex-shrink-0" />
              <a href="tel:+34932749890" class="hover:underline hover:text-[hsl(var(--color-accent))]">
                93 274 9890
              </a>
            </li>
            <li class="flex items-center">
              <Mail class="w-4 h-4 mr-2 flex-shrink-0" />
              <a href="mailto:repro@reprodisseny.com" class="hover:underline hover:text-[hsl(var(--color-accent))]">
                repro@reprodisseny.com
              </a>
            </li>
            <li>C/ Juan de Mena, 19, Barcelona</li>
          </ul>
        </div>

        <!-- Categorías -->
        <div>
          <h4 class="font-semibold mb-4">Categorías</h4>
          <ul class="space-y-2 text-sm">
            <li v-for="cat in categorias" :key="cat.slug">
              <button
                class="hover:underline hover:text-[hsl(var(--color-accent))]"
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
                class="hover:underline hover:text-[hsl(var(--color-accent))]"
                @click="navigateTo('/nosotros')"
              >
                Sobre Nosotros
              </button>
            </li>
            <li>
              <button
                class="hover:underline hover:text-[hsl(var(--color-accent))]"
                @click="navigateTo('/trabaja-con-nosotros')"
              >
                Trabaja con Nosotros
              </button>
            </li>
            <li>
              <button
                class="hover:underline hover:text-[hsl(var(--color-accent))]"
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
            <li><a href="/blog" class="hover:underline hover:text-[hsl(var(--color-accent))]">Blog</a></li>
            <li><a href="/faq" class="hover:underline hover:text-[hsl(var(--color-accent))]">FAQ</a></li>
            <li><a href="/mapa-web" class="hover:underline hover:text-[hsl(var(--color-accent))]">Mapa web</a></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Barra inferior -->
    <div class="border-t border-[hsl(var(--primary-foreground))]">
      <div class="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center text-xs">
        <div class="flex space-x-4">
          <a href="/mapa-web" class="hover:underline hover:text-[hsl(var(--color-accent))]">Mapa web</a>
          <a href="/politica-privacidad" class="hover:underline hover:text-[hsl(var(--color-accent))]">Política de privacidad</a>
          <a href="/terminos" class="hover:underline hover:text-[hsl(var(--color-accent))]">Términos y condiciones</a>
        </div>
        <p class="mt-4 md:mt-0">© {{ new Date().getFullYear() }} Repro Disseny.</p>
      </div>
    </div>
  </footer>
</template>