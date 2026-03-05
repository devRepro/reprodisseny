<script setup lang="ts">
import { ref } from "vue"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type TimelineItem = {
  year: number
  title: string
  text: string
  icon?: any
  // opcionales (para “nivel pro”)
  imageSrc?: string
  imageAlt?: string
  mediaLabel?: string // ej: "Xerox DocuTech", "iGen 3", "Centro de Producción", etc.
}

defineProps<{ items: TimelineItem[] }>()

const expanded = ref<Record<number, boolean>>({})
const toggle = (i: number) => (expanded.value[i] = !expanded.value[i])
</script>

<template>
  <section aria-label="Historia de la empresa" class="w-full">
    <ol class="space-y-10 lg:space-y-14">
      <li
        v-for="(it, idx) in items"
        :key="it.year"
        class="relative grid grid-cols-1 gap-6 lg:grid-cols-[1fr_80px_1fr] lg:gap-10"
      >
        <!-- =========================================================
             LEFT COLUMN (alternando: texto o media)
        ========================================================== -->
        <div
          class="min-w-0"
          :class="idx % 2 === 0 ? 'lg:order-1' : 'lg:order-3'"
        >
          <!-- Si idx par: texto a la izquierda; si impar: media a la izquierda -->
          <template v-if="idx % 2 === 0">
            <!-- Conector al eje -->
            <span
              class="hidden lg:block absolute top-7 left-[calc(50%-40px)] h-px w-10 bg-border"
              aria-hidden="true"
            />

            <div class="space-y-2">
              <time class="text-xs font-semibold tracking-wide text-muted-foreground" :datetime="String(it.year)">
                {{ it.year }}
              </time>
              <h3 class="text-xl font-semibold text-foreground">
                {{ it.title }}
              </h3>
            </div>

            <Card class="mt-4 border-border/70 shadow-sm">
              <CardContent class="p-5">
                <div class="relative">
                  <p
                    class="text-sm leading-relaxed text-muted-foreground whitespace-pre-line transition-[max-height] duration-300"
                    :class="expanded[idx] ? '' : 'max-h-[5.75rem] overflow-hidden'"
                    :id="`timeline-text-${idx}`"
                  >
                    {{ it.text }}
                  </p>

                  <div
                    v-if="!expanded[idx]"
                    class="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background to-transparent"
                    aria-hidden="true"
                  />
                </div>

                <div class="mt-4 flex items-center justify-between">
                  <div class="flex items-center gap-2 text-xs text-muted-foreground">
                    <component
                      v-if="it.icon"
                      :is="it.icon"
                      class="h-4 w-4 text-primary"
                      aria-hidden="true"
                    />
                    <span>Hito</span>
                  </div>

                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    class="h-8 px-0 text-primary"
                    @click="toggle(idx)"
                    :aria-expanded="expanded[idx] ? 'true' : 'false'"
                    :aria-controls="`timeline-text-${idx}`"
                  >
                    {{ expanded[idx] ? "Ver menos" : "Ver más" }}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </template>

          <template v-else>
            <!-- MEDIA a la izquierda (impares) -->
            <span
              class="hidden lg:block absolute top-7 left-[calc(50%-40px)] h-px w-10 bg-border"
              aria-hidden="true"
            />

            <Card class="overflow-hidden border-border/70 shadow-sm">
              <CardContent class="p-0">
                <div class="relative aspect-[16/9] w-full">
                  <!-- Imagen real si existe -->
                  <img
                    v-if="it.imageSrc"
                    :src="it.imageSrc"
                    :alt="it.imageAlt || it.title"
                    class="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <!-- Placeholder premium si no hay imagen -->
                  <div
                    v-else
                    class="absolute inset-0 bg-gradient-to-br from-muted via-muted/70 to-muted/30"
                  />

                  <!-- Overlay suave + contenido centrado -->
                  <div
                    class="absolute inset-0 flex items-center justify-center"
                    :class="it.imageSrc ? 'bg-black/15' : ''"
                    aria-hidden="true"
                  >
                    <div class="flex flex-col items-center gap-2">
                      <component
                        v-if="it.icon"
                        :is="it.icon"
                        class="h-10 w-10 text-primary/80"
                      />
                      <span
                        v-if="it.mediaLabel"
                        class="rounded-full bg-background/70 px-3 py-1 text-xs font-medium text-foreground ring-1 ring-border"
                      >
                        {{ it.mediaLabel }}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </template>
        </div>

        <!-- =========================================================
             CENTER AXIS (desktop) / LEFT AXIS (mobile)
        ========================================================== -->
        <div class="relative hidden lg:flex lg:order-2 lg:items-start lg:justify-center">
          <!-- Línea vertical por item (más sólida y consistente) -->
          <div class="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border/80" aria-hidden="true" />

          <!-- Punto + badge año -->
          <div class="relative mt-5 flex flex-col items-center">
            <span class="h-3.5 w-3.5 rounded-full bg-primary ring-4 ring-background" aria-hidden="true" />
            <span
              class="mt-3 rounded-full bg-muted px-3 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground ring-1 ring-border"
            >
              {{ it.year }}
            </span>
          </div>
        </div>

        <!-- Mobile axis (izquierda) -->
        <div class="relative lg:hidden">
          <div class="absolute left-0 top-0 h-full w-px bg-border/80" aria-hidden="true" />
          <span class="absolute -left-1 top-2 h-3.5 w-3.5 rounded-full bg-primary ring-4 ring-background" aria-hidden="true" />
        </div>

        <!-- =========================================================
             RIGHT COLUMN (alternando: media o texto)
        ========================================================== -->
        <div
          class="min-w-0"
          :class="idx % 2 === 0 ? 'lg:order-3' : 'lg:order-1'"
        >
          <!-- Si idx par: media derecha; si impar: texto derecha -->
          <template v-if="idx % 2 === 0">
            <span
              class="hidden lg:block absolute top-7 right-[calc(50%-40px)] h-px w-10 bg-border"
              aria-hidden="true"
            />

            <Card class="overflow-hidden border-border/70 shadow-sm">
              <CardContent class="p-0">
                <div class="relative aspect-[16/9] w-full">
                  <img
                    v-if="it.imageSrc"
                    :src="it.imageSrc"
                    :alt="it.imageAlt || it.title"
                    class="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div
                    v-else
                    class="absolute inset-0 bg-gradient-to-br from-muted via-muted/70 to-muted/30"
                  />

                  <div
                    class="absolute inset-0 flex items-center justify-center"
                    :class="it.imageSrc ? 'bg-black/15' : ''"
                    aria-hidden="true"
                  >
                    <div class="flex flex-col items-center gap-2">
                      <component
                        v-if="it.icon"
                        :is="it.icon"
                        class="h-10 w-10 text-primary/80"
                      />
                      <span
                        v-if="it.mediaLabel"
                        class="rounded-full bg-background/70 px-3 py-1 text-xs font-medium text-foreground ring-1 ring-border"
                      >
                        {{ it.mediaLabel }}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </template>

          <template v-else>
            <span
              class="hidden lg:block absolute top-7 right-[calc(50%-40px)] h-px w-10 bg-border"
              aria-hidden="true"
            />

            <div class="space-y-2">
              <time class="text-xs font-semibold tracking-wide text-muted-foreground lg:hidden" :datetime="String(it.year)">
  {{ it.year }}
</time>
              <h3 class="text-xl font-semibold text-foreground">
                {{ it.title }}
              </h3>
            </div>

            <Card class="mt-4 border-border/70 shadow-sm">
              <CardContent class="p-5">
                <div class="relative">
                  <p
                    class="text-sm leading-relaxed text-muted-foreground whitespace-pre-line transition-[max-height] duration-300"
                    :class="expanded[idx] ? '' : 'max-h-[5.75rem] overflow-hidden'"
                    :id="`timeline-text-${idx}`"
                  >
                    {{ it.text }}
                  </p>

                  <div
                    v-if="!expanded[idx]"
                    class="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background to-transparent"
                    aria-hidden="true"
                  />
                </div>

                <div class="mt-4 flex items-center justify-between">
                  <div class="flex items-center gap-2 text-xs text-muted-foreground">
                    <component
                      v-if="it.icon"
                      :is="it.icon"
                      class="h-4 w-4 text-primary"
                      aria-hidden="true"
                    />
                    <span>Hito</span>
                  </div>

                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    class="h-8 px-0 text-primary"
                    @click="toggle(idx)"
                    :aria-expanded="expanded[idx] ? 'true' : 'false'"
                    :aria-controls="`timeline-text-${idx}`"
                  >
                    {{ expanded[idx] ? "Ver menos" : "Ver más" }}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </template>
        </div>
      </li>
    </ol>
  </section>
</template>