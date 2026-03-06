<script setup lang="ts">
import { ref } from "vue"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type TimelineItem = {
  year: number
  title: string
  text: string
  icon?: any
  imageSrc?: string
  imageAlt?: string
  mediaLabel?: string 
}

defineProps<{ items: TimelineItem[] }>()

const expanded = ref<Record<number, boolean>>({})
const toggle = (i: number) => (expanded.value[i] = !expanded.value[i])
</script>

<template>
  <section aria-label="Historia cronológica de la empresa" class="w-full max-w-6xl mx-auto py-10 px-4 md:px-6">
    <ol class="space-y-16 lg:space-y-24">
      <li
        v-for="(it, idx) in items"
        :key="it.year"
        class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center group"
      >
        
        <div 
          class="w-full transition-transform duration-500 hover:scale-[1.02]"
          :class="idx % 2 !== 0 ? 'lg:order-2' : 'lg:order-1'"
        >
          <Card class="overflow-hidden border-none shadow-md bg-transparent">
            <CardContent class="p-0">
              <div class="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[4/3] w-full rounded-xl overflow-hidden">
                <img
                  v-if="it.imageSrc"
                  :src="it.imageSrc"
                  :alt="it.imageAlt || `Imagen representativa del hito de ${it.year}: ${it.title}`"
                  class="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div
                  v-else
                  class="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900"
                />

                <div
                  class="absolute inset-0 flex items-center justify-center transition-colors duration-300 group-hover:bg-black/5"
                  :class="it.imageSrc ? 'bg-black/15' : ''"
                  aria-hidden="true"
                >
                  <div class="flex flex-col items-center gap-3">
                    <component
                      v-if="it.icon"
                      :is="it.icon"
                      class="h-12 w-12 text-white drop-shadow-md"
                    />
                    <span
                      v-if="it.mediaLabel"
                      class="rounded-full bg-background/90 px-4 py-1.5 text-xs font-semibold tracking-wide text-foreground shadow-sm backdrop-blur-sm"
                    >
                      {{ it.mediaLabel }}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div 
          class="w-full flex flex-col justify-center"
          :class="idx % 2 !== 0 ? 'lg:order-1' : 'lg:order-2'"
        >
          <div class="space-y-3">
            <time 
              class="block text-4xl lg:text-5xl font-extrabold text-primary tracking-tight" 
              :datetime="String(it.year)"
            >
              {{ it.year }}
            </time>
            
            <h3 class="text-2xl font-semibold text-foreground leading-snug">
              {{ it.title }}
            </h3>
          </div>

          <div class="mt-4 relative">
            <p
              class="text-base leading-relaxed text-muted-foreground whitespace-pre-line transition-[max-height] duration-500 ease-in-out"
              :class="expanded[idx] ? 'max-h-[1000px]' : 'max-h-[4.5rem] overflow-hidden'"
              :id="`timeline-text-${idx}`"
            >
              {{ it.text }}
            </p>

            <div
              v-if="!expanded[idx]"
              class="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent"
              aria-hidden="true"
            />
          </div>

          <div class="mt-4 flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="h-8 px-0 text-primary hover:bg-transparent hover:text-primary/80 font-semibold"
              @click="toggle(idx)"
              :aria-expanded="expanded[idx] ? 'true' : 'false'"
              :aria-controls="`timeline-text-${idx}`"
            >
              {{ expanded[idx] ? "Ocultar detalles" : "Leer más" }}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" height="16" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                class="ml-1 transition-transform duration-300"
                :class="expanded[idx] ? 'rotate-180' : 'rotate-0'"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </Button>
          </div>
        </div>

      </li>
    </ol>
  </section>
</template>