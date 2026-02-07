<!-- components/marketing/ProcessSection.vue -->
<script setup lang="ts">
    import { Button } from "@/components/ui/button"
    
    type Step = {
      title: string
      description: string
    }
    
    const props = withDefaults(
      defineProps<{
        title?: string
        steps?: Step[]
        ctaText?: string
        ctaLabel?: string
        ctaHref?: string
      }>(),
      {
        title: "Un proceso claro, un único interlocutor",
        steps: () => [
          {
            title: "Nos explicas tu necesidad",
            description:
              "Analizamos tu proyecto, plazos y objetivos para proponerte la mejor solución desde el inicio.",
          },
          {
            title: "Te asesoramos y lo validamos contigo",
            description:
              "Te ayudamos a tomar decisiones técnicas y creativas antes de producir, evitando errores y sobrecostes.",
          },
          {
            title: "Producimos con control y calidad",
            description:
              "Producimos internamente o con partners de confianza, supervisando cada fase del proceso.",
          },
          {
            title: "Entregamos o instalamos",
            description:
              "Nos ocupamos de la logística, distribución e instalación para que el resultado final sea impecable.",
          },
        ],
        ctaText: "¿Empezamos? Cuéntanos tu proyecto y te asesoramos sin compromiso.",
        ctaLabel: "Contacta con un experto",
        ctaHref: "/contacto",
      }
    )
    </script>
    
    <template>
      <section class="w-full bg-white">
        <div class="mx-auto w-full max-w-[1200px] px-4 md:px-0">
          <!-- Contenedor principal (equivalente a “proceso de trabajo”) -->
          <div
            class="relative flex flex-col items-center justify-center gap-6 bg-white
                   min-h-[416px] py-6"
          >
            <!-- Título -->
            <h2 class="w-full text-center text-[#212121] font-semibold text-[30px] leading-[36px]">
              {{ props.title }}
            </h2>
    
            <!-- Línea (Line 25) a todo el ancho del bloque -->
            <div class="w-full border-t border-[#212121]" />
    
            <!-- Pasos (Frame 19) -->
            <div class="w-full py-6">
              <div
                class="grid grid-cols-1 gap-10
                       md:grid-cols-2
                       xl:grid-cols-4 xl:gap-10"
              >
                <div
                  v-for="(s, idx) in props.steps"
                  :key="idx"
                  class="box-border flex items-start gap-5
                         rounded-[12px] border-2 border-[rgba(0,79,120,0.5)]
                         px-5 py-6
                         w-full xl:w-[277px] xl:h-[204px]"
                >
                  <!-- Número -->
                  <div
                    class="shrink-0 font-bold text-[40px] leading-[48px]
                           text-[rgba(0,79,120,0.5)]"
                  >
                    {{ idx + 1 }}
                  </div>
    
                  <!-- Texto -->
                  <div class="flex flex-col items-start gap-6 w-full">
                    <h3 class="w-full text-[#004F78] font-semibold text-[20px] leading-[26px]">
                      {{ s.title }}
                    </h3>
                    <p class="w-full text-[#212121] font-normal text-[14px] leading-[20px]">
                      {{ s.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
    
            <!-- CTA (Frame 177) -->
            <div class="flex flex-col items-center justify-center gap-5 text-center max-w-[514px]">
              <p class="text-[#212121] font-normal text-[16px] leading-[22px]">
                {{ props.ctaText }}
              </p>
    
              <Button
                as-child
                class="h-[38px] px-4 py-2 rounded-[8px] bg-[#0076B3] hover:bg-[#006aa1] text-white"
              >
                <NuxtLink :to="props.ctaHref">
                  {{ props.ctaLabel }}
                </NuxtLink>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </template>
    