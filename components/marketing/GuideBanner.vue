<script setup lang="ts">
  import { computed } from "vue"
  import { Button } from "@/components/ui/button"
  
  type CTA = { label: string; to: string; external?: boolean }
  
  type Props = {
    title?: string
    cta?: CTA
    ctaText?: string
    to?: string
    /** Ruta base a la carpeta donde están las imágenes (en /public) */
    basePath?: string
    height?: number
    external?: boolean
    rounded?: boolean
    fullBleed?: boolean
    containerClass?: string
    /** Punto focal para el object-position */
    objectPosition?: string
  }
  
  const props = withDefaults(defineProps<Props>(), {
    title: "Cómo preparar tus archivos",
    ctaText: "Ver la guía rápida",
    to: "/guia-impresion",
    basePath: "/img/ui/banners/como-preparar-archivos",
    height: 240,
    external: false,
    rounded: false,
    fullBleed: true,
    containerClass: "mx-auto w-full max-w-[1440px] px-6 lg:px-10 2xl:px-[120px]",
    objectPosition: "right center",
  })
  
  const ctaLabel = computed(() => props.cta?.label ?? props.ctaText)
  const ctaTo = computed(() => props.cta?.to ?? props.to)
  const isExternal = computed(() => Boolean(props.cta?.external ?? props.external))
  
  const base = computed(() => {
    const s = String(props.basePath || "").trim()
    if (!s) return ""
    return s.startsWith("/") ? s.replace(/\/$/, "") : `/${s.replace(/\/$/, "")}`
  })
  
  const cssVars = computed(
    () =>
      ({
        "--gb-h": `${props.height}px`,
        "--gb-pos": props.objectPosition,
      }) as Record<string, string>
  )
  
  /** Puedes ajustar aquí si un día cambias el set */
  const widths = [1440, 1920, 2560, 2880, 3840, 4096] as const
  
  const webpSrcset = computed(() =>
    widths.map((w) => `${base.value}/archivos_banner_${w}w.webp ${w}w`).join(", ")
  )
  
  const jpgSrcset = computed(() =>
    widths.map((w) => `${base.value}/archivos_banner_${w}w.jpg ${w}w`).join(", ")
  )
  
  /** Fallback: una imagen “media” para el <img src=""> */
  const fallbackJpg = computed(() => `${base.value}/archivos_banner_1920w.jpg`)
  </script>
  
  <template>
    <section
      :class="
        props.fullBleed
          ? 'relative left-1/2 right-1/2 -mx-[50vw] w-[100vw] overflow-x-clip'
          : ''
      "
    >
      <div
        class="relative overflow-hidden bg-background"
        :class="props.rounded ? 'rounded-xl' : ''"
        :style="cssVars"
      >
        <div class="relative h-[var(--gb-h)] w-full">
          <!-- Fondo responsive (control total en /public) -->
          <picture>
            <source type="image/webp" :srcset="webpSrcset" sizes="100vw" />
            <source type="image/jpeg" :srcset="jpgSrcset" sizes="100vw" />
            <img
              :src="fallbackJpg"
              alt=""
              class="absolute inset-0 h-full w-full object-cover"
              :style="{ objectPosition: 'var(--gb-pos)' }"
              loading="lazy"
              decoding="async"
            />
          </picture>
  
          <!-- Overlay -->
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
  
          <!-- Contenido -->
          <div class="relative h-full">
            <div :class="props.containerClass" class="h-full">
              <div class="flex h-full flex-col items-start justify-center gap-5">
                <h2 class="text-2xl font-semibold leading-tight text-foreground md:text-3xl">
                  {{ title }}
                </h2>
  
                <Button as-child class="h-11 rounded-full px-6">
                  <NuxtLink
                    :to="ctaTo"
                    :target="isExternal ? '_blank' : undefined"
                    :rel="isExternal ? 'noopener noreferrer' : undefined"
                  >
                    {{ ctaLabel }}
                  </NuxtLink>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </template>s