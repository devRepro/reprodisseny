<!-- /pages/guia-impresion.vue -->
<!-- /pages/guia-impresion.vue -->
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
    <section class="mx-auto max-w-[1200px] px-6 pt-12 pb-8">
      <div class="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div class="p-8 md:p-10 flex flex-col gap-6">
          <div class="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" class="rounded-full">Guía rápida</Badge>
            <Badge variant="outline" class="rounded-full">Archivos de impresión</Badge>
          </div>

          <div class="grid gap-4">
            <h1 class="text-3xl md:text-4xl font-semibold tracking-tight">
              Cómo preparar archivos listos para imprimir
            </h1>
            <p class="text-muted-foreground text-base md:text-lg max-w-3xl">
              Una checklist clara para evitar errores habituales: sangrado, color,
              tipografías y exportación. Si lo prefieres, también podemos revisar tu
              archivo antes de imprimir.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <Button as-child class="rounded-xl">
              <NuxtLink to="/contacto">
                Solicitar revisión de archivo
                <ArrowRight class="ml-2 h-4 w-4" />
              </NuxtLink>
            </Button>

            <Button variant="outline" class="rounded-xl">
              <FileDown class="mr-2 h-4 w-4" />
              Descargar plantilla (fake)
            </Button>
          </div>

          <div class="flex flex-wrap gap-3 text-sm text-muted-foreground">
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
    <section class="mx-auto max-w-[1200px] px-6 pb-16">
      <div class="grid lg:grid-cols-[1fr_380px] gap-6">
        <!-- Left column -->
        <div class="space-y-6">
          <!-- Cards checklist -->
          <div class="grid md:grid-cols-2 gap-4">
            <Card v-for="c in checklist" :key="c.title" class="rounded-2xl">
              <CardHeader class="space-y-2">
                <CardTitle class="flex items-center gap-2 text-lg">
                  <component :is="c.icon" class="h-5 w-5" />
                  {{ c.title }}
                </CardTitle>
                <CardDescription>
                  Recomendaciones básicas para entregar archivos sin sorpresas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul class="space-y-2 text-sm">
                  <li v-for="it in c.items" :key="it" class="flex gap-2">
                    <CheckCircle2 class="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{{ it }}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <!-- Export block -->
          <Card class="rounded-2xl">
            <CardHeader>
              <CardTitle class="text-lg">Exportación recomendada (PDF)</CardTitle>
              <CardDescription>
                Configuración típica para imprenta. (Esta sección es orientativa.)
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="rounded-xl border p-4 bg-muted/30">
                <div class="grid sm:grid-cols-2 gap-3 text-sm">
                  <div
                    v-for="row in specs"
                    :key="row.k"
                    class="flex justify-between gap-4"
                  >
                    <span class="text-muted-foreground">{{ row.k }}</span>
                    <span class="font-medium text-right">{{ row.v }}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div class="text-sm text-muted-foreground space-y-2">
                <p>
                  Si el diseño va “a sangre” (fondo o imagen hasta el borde), asegúrate de
                  que hay sangrado. Si tienes dudas, envíanos una prueba y te lo
                  confirmamos antes de producir.
                </p>
                <p class="inline-flex items-start gap-2">
                  <AlertTriangle class="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    Evita enviar archivos en Word/PowerPoint si el resultado debe ser
                    exacto: mejor PDF.
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          <!-- FAQ -->
          <Card class="rounded-2xl">
            <CardHeader>
              <CardTitle class="text-lg">Preguntas frecuentes</CardTitle>
              <CardDescription
                >Respuestas rápidas (fake) a dudas típicas.</CardDescription
              >
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
                    variar; si tienes la duda, indícanos el producto y te lo confirmamos.
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
                  <AccordionTrigger
                    >¿Qué resolución deben tener las imágenes?</AccordionTrigger
                  >
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
          <Card class="rounded-2xl sticky top-6">
            <CardHeader>
              <CardTitle class="text-lg">Checklist final antes de enviar</CardTitle>
              <CardDescription>En 30 segundos, revisa esto.</CardDescription>
            </CardHeader>
            <CardContent class="space-y-3 text-sm">
              <div class="flex gap-2">
                <CheckCircle2 class="h-4 w-4 mt-0.5" />
                <span>PDF a tamaño final + sangrado (si aplica)</span>
              </div>
              <div class="flex gap-2">
                <CheckCircle2 class="h-4 w-4 mt-0.5" />
                <span>CMYK e imágenes correctas</span>
              </div>
              <div class="flex gap-2">
                <CheckCircle2 class="h-4 w-4 mt-0.5" />
                <span>Tipografías incrustadas o a contornos</span>
              </div>
              <div class="flex gap-2">
                <CheckCircle2 class="h-4 w-4 mt-0.5" />
                <span>Sin elementos importantes pegados al corte</span>
              </div>

              <Separator class="my-2" />

              <Button class="w-full rounded-xl" as-child>
                <NuxtLink to="/contacto">
                  Envíanos tu archivo
                  <ArrowRight class="ml-2 h-4 w-4" />
                </NuxtLink>
              </Button>

              <Button variant="outline" class="w-full rounded-xl">
                <FileDown class="mr-2 h-4 w-4" />
                Plantillas (fake)
              </Button>

              <p class="text-xs text-muted-foreground">
                * Contenido de demostración. Luego lo podemos conectar a SharePoint / CMS.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  </main>
</template>
