<script setup lang="ts">
import { computed } from "vue";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  CheckCircle2,
  FileDown,
  Printer,
  Crop,
  Palette,
  Images,
  Type,
  AlertTriangle,
  ArrowRight,
} from "lucide-vue-next";

definePageMeta({
  layout: "default",
});

useSeoMeta({
  title: "Cómo preparar archivos para imprimir | Repro Disseny",
  description:
    "Guía rápida para preparar archivos de impresión: sangrado, marcas de corte, color, tipografías y exportación a PDF.",
  ogTitle: "Cómo preparar archivos para imprimir | Repro Disseny",
  ogDescription:
    "Checklist y recomendaciones para enviar archivos listos para imprimir (PDF, sangrado, color e imágenes).",
  robots: "index,follow",
});

const pageContainerClass = "container-content";
const pageSectionSpaceClass = "py-10 md:py-14 lg:py-16";
const pageBottomSpaceClass = "pb-14 md:pb-16 lg:pb-20";

const checklist = [
  {
    title: "Sangrado y márgenes",
    icon: Crop,
    items: [
      "Añade 3 mm de sangrado alrededor (si aplica).",
      "Deja una zona de seguridad de 3–5 mm para textos y logotipos.",
      "Evita elementos importantes pegados al corte.",
    ],
  },
  {
    title: "Color y tintas",
    icon: Palette,
    items: [
      "Trabaja en CMYK para impresión.",
      "Para colores corporativos críticos, indica referencias Pantone (si hace falta).",
      "Evita negro enriquecido en textos pequeños (usa 100% K para tipografía fina).",
    ],
  },
  {
    title: "Imágenes y resolución",
    icon: Images,
    items: [
      "Resolución recomendada: 300 ppp (a tamaño final).",
      "Incrusta o vincula correctamente las imágenes (sin faltantes).",
      "Evita capturas o imágenes de baja calidad escaladas.",
    ],
  },
  {
    title: "Tipografías",
    icon: Type,
    items: [
      "Convierte las tipografías a contornos o incrústalas en el PDF.",
      "Revisa interlineados y kerning después de exportar.",
      "Evita fuentes “trial” o sin licencia para producción.",
    ],
  },
];

const specs = computed(() => [
  { k: "Formato de entrega", v: "PDF (recomendado)" },
  { k: "Perfil de color", v: "CMYK (ICC según necesidad)" },
  { k: "Sangrado", v: "3 mm (estándar)" },
  { k: "Marcas de corte", v: "Sí (si el diseño lo requiere)" },
  { k: "Resolución de imágenes", v: "300 ppp (a tamaño final)" },
  { k: "Transparencias", v: "Aplanar si hay problemas de RIP" },
]);
</script>

<template>
  <main class="bg-background text-foreground">
    <!-- Hero -->
    <section class="bg-brand-base-light">
      <div :class="[pageContainerClass, pageSectionSpaceClass]">
        <div class="mx-auto max-w-4xl">
          <div class="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" class="rounded-full">Guía rápida</Badge>
            <Badge variant="outline" class="rounded-full">Archivos de impresión</Badge>
          </div>

          <div class="mt-5 max-w-3xl">
            <h1
              class="text-3xl font-semibold leading-tight text-brand-base-dark md:text-4xl"
            >
              Cómo preparar archivos listos para imprimir
            </h1>

            <p
              class="mt-4 text-base leading-7 text-brand-base-dark/80 md:text-lg md:leading-8"
            >
              Una checklist clara para evitar errores habituales: sangrado, color,
              tipografías y exportación. Si lo prefieres, también podemos revisar tu
              archivo antes de imprimir.
            </p>
          </div>

          <div class="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button as-child class="rounded-xl">
              <NuxtLink to="/contacto">
                Solicitar revisión de archivo
                <ArrowRight class="ml-2 h-4 w-4" />
              </NuxtLink>
            </Button>

            <Button variant="outline" class="rounded-xl bg-white/70">
              <FileDown class="mr-2 h-4 w-4" />
              Descargar plantilla (fake)
            </Button>
          </div>

          <div
            class="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm text-brand-base-dark/80"
          >
            <div class="inline-flex items-center gap-2">
              <Printer class="h-4 w-4" />
              <span>PDF para producción</span>
            </div>
            <div class="inline-flex items-center gap-2">
              <CheckCircle2 class="h-4 w-4" />
              <span>Checklist antes de enviar</span>
            </div>
            <div class="inline-flex items-center gap-2">
              <AlertTriangle class="h-4 w-4" />
              <span>Evita retrasos por remaquetación</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Content -->
    <section class="bg-background" :class="pageBottomSpaceClass">
      <div :class="pageContainerClass">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
          <!-- Left column -->
          <div class="space-y-6">
            <!-- Cards checklist -->
            <div class="grid gap-4 md:grid-cols-2">
              <Card
                v-for="c in checklist"
                :key="c.title"
                class="rounded-3xl border-black/5 bg-card shadow-sm"
              >
                <CardHeader class="space-y-3">
                  <CardTitle class="flex items-center gap-2 text-lg">
                    <component :is="c.icon" class="h-5 w-5 text-brand-base-dark" />
                    {{ c.title }}
                  </CardTitle>

                  <CardDescription class="text-sm leading-6">
                    Recomendaciones básicas para entregar archivos sin sorpresas.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <ul class="space-y-3 text-sm leading-6">
                    <li v-for="it in c.items" :key="it" class="flex gap-2.5">
                      <CheckCircle2
                        class="mt-0.5 h-4 w-4 shrink-0 text-brand-base-dark"
                      />
                      <span>{{ it }}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <!-- Export block -->
            <Card class="rounded-3xl border-black/5 bg-card shadow-sm">
              <CardHeader>
                <CardTitle class="text-xl">Exportación recomendada (PDF)</CardTitle>
                <CardDescription class="text-sm leading-6">
                  Configuración típica para imprenta. Esta sección es orientativa.
                </CardDescription>
              </CardHeader>

              <CardContent class="space-y-5">
                <div class="rounded-2xl border border-black/5 bg-muted/30 p-4 md:p-5">
                  <div class="grid gap-3 text-sm sm:grid-cols-2">
                    <div
                      v-for="row in specs"
                      :key="row.k"
                      class="flex justify-between gap-4"
                    >
                      <span class="text-muted-foreground">{{ row.k }}</span>
                      <span class="text-right font-medium">{{ row.v }}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div class="space-y-3 text-sm leading-6 text-muted-foreground">
                  <p>
                    Si el diseño va a sangre, asegúrate de que hay sangrado real en el
                    archivo. Si tienes dudas, envíanos una prueba y te lo confirmamos
                    antes de producir.
                  </p>

                  <p class="inline-flex items-start gap-2">
                    <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      Evita enviar archivos en Word o PowerPoint si el resultado debe ser
                      exacto: mejor PDF.
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <!-- FAQ -->
            <Card class="rounded-3xl border-black/5 bg-card shadow-sm">
              <CardHeader>
                <CardTitle class="text-xl">Preguntas frecuentes</CardTitle>
                <CardDescription class="text-sm leading-6">
                  Respuestas rápidas a dudas típicas.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Accordion type="single" collapsible class="w-full">
                  <AccordionItem value="q1">
                    <AccordionTrigger>¿Tengo que poner marcas de corte?</AccordionTrigger>
                    <AccordionContent>
                      Si el archivo está a tamaño final y hay sangrado, normalmente sí. En
                      cualquier caso, con un PDF bien preparado nos va perfecto.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="q2">
                    <AccordionTrigger>¿Qué sangrado debo usar?</AccordionTrigger>
                    <AccordionContent>
                      Habitualmente 3 mm. En formatos especiales o gran formato puede
                      variar; si tienes la duda, indícanos el producto y te lo
                      confirmamos.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="q3">
                    <AccordionTrigger>¿RGB o CMYK?</AccordionTrigger>
                    <AccordionContent>
                      Recomendamos CMYK para asegurar coherencia en impresión. Si tienes
                      colores corporativos críticos, también podemos trabajar con Pantone
                      según el proyecto.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="q4">
                    <AccordionTrigger>
                      ¿Qué resolución deben tener las imágenes?
                    </AccordionTrigger>
                    <AccordionContent>
                      300 ppp a tamaño final es el estándar en pequeño formato. En gran
                      formato depende de la distancia de visualización.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>

          <!-- Right column -->
          <aside class="space-y-4">
            <Card
              class="border-black/5 bg-muted/20 rounded-3xl shadow-sm lg:sticky lg:top-24"
            >
              <CardHeader>
                <CardTitle class="text-xl">Checklist final antes de enviar</CardTitle>
                <CardDescription class="text-sm leading-6">
                  En 30 segundos, revisa esto.
                </CardDescription>
              </CardHeader>

              <CardContent class="space-y-3 text-sm leading-6">
                <div class="flex gap-2.5">
                  <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-brand-base-dark" />
                  <span>PDF a tamaño final + sangrado (si aplica)</span>
                </div>
                <div class="flex gap-2.5">
                  <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-brand-base-dark" />
                  <span>CMYK e imágenes correctas</span>
                </div>
                <div class="flex gap-2.5">
                  <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-brand-base-dark" />
                  <span>Tipografías incrustadas o a contornos</span>
                </div>
                <div class="flex gap-2.5">
                  <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-brand-base-dark" />
                  <span>Sin elementos importantes pegados al corte</span>
                </div>

                <Separator class="my-2" />

                <Button class="w-full rounded-xl" as-child>
                  <NuxtLink to="/contacto">
                    Envíanos tu archivo
                    <ArrowRight class="ml-2 h-4 w-4" />
                  </NuxtLink>
                </Button>

                <Button variant="outline" class="w-full rounded-xl bg-background">
                  <FileDown class="mr-2 h-4 w-4" />
                  Plantillas (fake)
                </Button>

                <p class="text-xs leading-5 text-muted-foreground">
                  * Contenido de demostración. Luego lo podemos conectar a SharePoint o
                  CMS.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </section>
  </main>
</template>
