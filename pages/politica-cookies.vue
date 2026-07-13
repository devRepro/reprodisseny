<script setup lang="ts">
import { CalendarDays, Cookie, Mail, Settings2, ShieldCheck } from "lucide-vue-next";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

declare global {
  interface Window {
    UC_UI?: {
      showSecondLayer?: () => void;
    };
  }
}

type CookieCategory = {
  title: string;
  required: boolean;
  description: string;
  examples: string[];
};

const controller = {
  name: "Repro Disseny",
  address: "Carrer de Juan de Mena, 19, 08035 Barcelona",
  email: "rgpd@reprodisseny.com",
  website: "https://reprodisseny.com",
};

const lastUpdated = {
  text: "13 de julio de 2026",
  datetime: "2026-07-13",
};

const sections = [
  { id: "definicion", title: "1. Qué son las cookies" },
  { id: "responsable", title: "2. Responsable" },
  { id: "tecnologias", title: "3. Tecnologías utilizadas" },
  { id: "categorias", title: "4. Categorías de cookies" },
  { id: "inventario", title: "5. Cookies utilizadas" },
  { id: "consentimiento", title: "6. Consentimiento y configuración" },
  { id: "terceros", title: "7. Cookies de terceros" },
  { id: "transferencias", title: "8. Transferencias internacionales" },
  { id: "navegador", title: "9. Configuración del navegador" },
  { id: "actualizaciones", title: "10. Actualizaciones" },
  { id: "contacto", title: "11. Contacto" },
];

const cookieCategories: CookieCategory[] = [
  {
    title: "Cookies necesarias",
    required: true,
    description:
      "Permiten el funcionamiento básico y seguro de la web. Se utilizan, entre otras finalidades, para recordar las preferencias de consentimiento, proteger formularios, mantener la seguridad y prestar servicios solicitados expresamente.",
    examples: [
      "Gestión del consentimiento",
      "Seguridad y prevención de abusos",
      "Funcionamiento de formularios",
      "Preferencias imprescindibles de navegación",
    ],
  },
  {
    title: "Cookies de preferencias",
    required: false,
    description:
      "Permiten recordar decisiones del usuario que modifican el comportamiento o la apariencia de la web, como determinadas preferencias de visualización, idioma o región.",
    examples: [
      "Idioma o región",
      "Preferencias de visualización",
      "Opciones seleccionadas por el usuario",
    ],
  },
  {
    title: "Cookies de medición y analítica",
    required: false,
    description:
      "Permiten conocer de forma agregada cómo se utiliza el sitio web, qué páginas se visitan, cómo se navega y si se producen errores, con el objetivo de mejorar su funcionamiento y rendimiento.",
    examples: [
      "Número de visitas",
      "Páginas consultadas",
      "Duración aproximada de las sesiones",
      "Interacciones y rendimiento de la web",
    ],
  },
  {
    title: "Cookies de marketing",
    required: false,
    description:
      "Se utilizan para medir campañas, atribuir conversiones, limitar la repetición de anuncios o mostrar comunicaciones comerciales relacionadas con los intereses del usuario.",
    examples: [
      "Medición de campañas",
      "Atribución de conversiones",
      "Remarketing",
      "Personalización publicitaria",
    ],
  },
  {
    title: "Contenido y servicios externos",
    required: false,
    description:
      "Determinados mapas, vídeos, recursos multimedia, tipografías, widgets o servicios integrados pueden utilizar cookies o tecnologías similares cuando el usuario autoriza su carga.",
    examples: [
      "Mapas interactivos",
      "Vídeos externos",
      "Widgets de terceros",
      "Recursos multimedia integrados",
    ],
  },
];

function openCookieSettings() {
  if (!import.meta.client) return;

  if (typeof window.UC_UI?.showSecondLayer === "function") {
    window.UC_UI.showSecondLayer();
    return;
  }

  console.warn(
    "No se ha podido abrir el panel de Usercentrics. Revisa que la CMP se haya cargado correctamente."
  );
}

useSeoMeta({
  title: "Política de cookies",
  description:
    "Consulta qué cookies y tecnologías similares utiliza Repro Disseny, para qué se emplean y cómo puedes gestionar o retirar tu consentimiento.",
  ogTitle: "Política de cookies | Repro Disseny",
  ogDescription:
    "Información sobre las cookies utilizadas en la web de Repro Disseny y las opciones disponibles para configurarlas.",
  robots: "index,follow",
});

useHead({
  link: [
    {
      rel: "canonical",
      href: "https://reprodisseny.com/politica-cookies",
    },
  ],
});
</script>

<template>
  <main class="bg-background text-foreground">
    <section class="border-b border-border/60 bg-brand-bg-2/40">
      <div class="container-content py-12 md:py-16 lg:py-20">
        <div class="max-w-3xl space-y-6">
          <div
            class="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/80 px-4 py-2 text-sm font-medium text-primary"
          >
            <Cookie class="size-4" aria-hidden="true" />
            Privacidad y consentimiento
          </div>

          <div class="space-y-4">
            <h1 class="font-h1 text-4xl font-extrabold tracking-tight md:text-5xl">
              Política de cookies
            </h1>

            <p class="max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Esta política explica qué cookies y tecnologías similares pueden utilizarse
              en la web de Repro Disseny, con qué finalidad y cómo puede aceptar, rechazar
              o modificar sus preferencias.
            </p>
          </div>

          <div class="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <span class="inline-flex items-center gap-2">
              <CalendarDays class="size-4" aria-hidden="true" />
              Última actualización:
              <time :datetime="lastUpdated.datetime">
                {{ lastUpdated.text }}
              </time>
            </span>

            <button
              type="button"
              class="inline-flex items-center gap-2 font-medium text-primary underline-offset-4 hover:underline"
              @click="openCookieSettings"
            >
              <Settings2 class="size-4" aria-hidden="true" />
              Configurar cookies
            </button>
          </div>
        </div>
      </div>
    </section>

    <div class="container-content py-12 md:py-16">
      <div class="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14">
        <aside class="hidden lg:block">
          <div class="sticky top-24">
            <Card class="border-border/60 bg-card/80 shadow-sm">
              <CardContent class="p-5">
                <p
                  class="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                >
                  En esta página
                </p>

                <nav aria-label="Índice de la política de cookies">
                  <ol class="space-y-1">
                    <li v-for="item in sections" :key="item.id">
                      <a
                        :href="`#${item.id}`"
                        class="block rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {{ item.title }}
                      </a>
                    </li>
                  </ol>
                </nav>
              </CardContent>
            </Card>
          </div>
        </aside>

        <article class="min-w-0 max-w-4xl space-y-10">
          <section id="definicion" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">1. Qué son las cookies</h2>

            <p class="leading-relaxed text-muted-foreground">
              Las cookies son pequeños archivos o fragmentos de información que una página
              web almacena o consulta en el navegador o dispositivo del usuario durante la
              navegación.
            </p>

            <p class="leading-relaxed text-muted-foreground">
              Permiten, por ejemplo, mantener determinadas funciones de la web, recordar
              preferencias, medir su utilización o cargar servicios proporcionados por
              terceros.
            </p>

            <p class="leading-relaxed text-muted-foreground">
              Esta política también se aplica a tecnologías similares, como el
              almacenamiento local del navegador, identificadores en línea, etiquetas,
              píxeles, SDK, web beacons y otros mecanismos que permiten almacenar o
              recuperar información del dispositivo.
            </p>
          </section>

          <Separator />

          <section id="responsable" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">2. Responsable</h2>

            <Card class="border-border/60 bg-muted/30">
              <CardContent class="space-y-3 p-5 text-muted-foreground">
                <p>
                  <strong class="text-foreground">Titular de la web:</strong>
                  {{ controller.name }}
                </p>

                <p>
                  <strong class="text-foreground">Sitio web:</strong>
                  {{ controller.website }}
                </p>

                <p>
                  <strong class="text-foreground">Dirección:</strong>
                  {{ controller.address }}
                </p>

                <p>
                  <strong class="text-foreground">
                    Correo de protección de datos:
                  </strong>

                  <a
                    :href="`mailto:${controller.email}`"
                    class="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {{ controller.email }}
                  </a>
                </p>
              </CardContent>
            </Card>

            <p class="leading-relaxed text-muted-foreground">
              Puede consultar información adicional sobre el tratamiento de datos
              personales en nuestra
              <NuxtLink
                to="/politica-privacidad"
                class="font-medium text-primary underline-offset-4 hover:underline"
              >
                Política de privacidad</NuxtLink
              >.
            </p>
          </section>

          <Separator />

          <section id="tecnologias" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">3. Tecnologías utilizadas</h2>

            <p class="leading-relaxed text-muted-foreground">
              Las tecnologías utilizadas pueden clasificarse según quién las gestione y
              según el tiempo que permanezcan activas.
            </p>

            <div class="grid gap-4 md:grid-cols-2">
              <Card class="border-border/60">
                <CardContent class="space-y-3 p-5">
                  <h3 class="font-semibold">Cookies propias</h3>

                  <p class="text-sm leading-relaxed text-muted-foreground">
                    Son gestionadas desde el dominio de Repro Disseny y se utilizan para
                    prestar funciones propias del sitio web.
                  </p>
                </CardContent>
              </Card>

              <Card class="border-border/60">
                <CardContent class="space-y-3 p-5">
                  <h3 class="font-semibold">Cookies de terceros</h3>

                  <p class="text-sm leading-relaxed text-muted-foreground">
                    Son gestionadas por proveedores externos cuyos servicios se integran
                    en la web, como herramientas de medición, contenidos externos o
                    servicios publicitarios.
                  </p>
                </CardContent>
              </Card>

              <Card class="border-border/60">
                <CardContent class="space-y-3 p-5">
                  <h3 class="font-semibold">Cookies de sesión</h3>

                  <p class="text-sm leading-relaxed text-muted-foreground">
                    Se mantienen mientras dura la sesión de navegación y normalmente se
                    eliminan cuando se cierra el navegador.
                  </p>
                </CardContent>
              </Card>

              <Card class="border-border/60">
                <CardContent class="space-y-3 p-5">
                  <h3 class="font-semibold">Cookies persistentes</h3>

                  <p class="text-sm leading-relaxed text-muted-foreground">
                    Permanecen almacenadas durante un periodo determinado, que puede
                    variar según su finalidad y proveedor.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator />

          <section id="categorias" class="scroll-mt-24 space-y-5">
            <h2 class="text-2xl font-bold tracking-tight">4. Categorías de cookies</h2>

            <div class="space-y-4">
              <Card
                v-for="category in cookieCategories"
                :key="category.title"
                class="border-border/60"
              >
                <CardContent class="space-y-4 p-5 md:p-6">
                  <div
                    class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <h3 class="text-lg font-semibold">
                      {{ category.title }}
                    </h3>

                    <span
                      class="inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold"
                      :class="
                        category.required
                          ? 'border-primary/20 bg-primary/5 text-primary'
                          : 'border-border bg-muted/50 text-muted-foreground'
                      "
                    >
                      {{
                        category.required ? "Siempre activas" : "Requieren consentimiento"
                      }}
                    </span>
                  </div>

                  <p class="leading-relaxed text-muted-foreground">
                    {{ category.description }}
                  </p>

                  <ul
                    class="grid list-disc gap-2 pl-5 text-sm text-muted-foreground sm:grid-cols-2"
                  >
                    <li v-for="example in category.examples" :key="example">
                      {{ example }}
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator />

          <section id="inventario" class="scroll-mt-24 space-y-5">
            <h2 class="text-2xl font-bold tracking-tight">
              5. Cookies utilizadas en esta web
            </h2>

            <p class="leading-relaxed text-muted-foreground">
              El inventario actualizado de tecnologías utilizadas se encuentra en el panel
              de configuración de consentimiento gestionado mediante Usercentrics.
            </p>

            <p class="leading-relaxed text-muted-foreground">
              En ese panel puede consultar, para cada servicio o tecnología, su proveedor,
              finalidad, categoría, duración, almacenamiento utilizado y la información
              facilitada por el tercero.
            </p>

            <Card class="border-primary/15 bg-primary/5">
              <CardContent class="space-y-4 p-5 md:p-6">
                <div class="flex items-start gap-3">
                  <Settings2
                    class="mt-1 size-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />

                  <div class="space-y-3">
                    <h3 class="font-semibold">
                      Consultar el inventario y las preferencias
                    </h3>

                    <p class="text-sm leading-relaxed text-muted-foreground">
                      Abra el panel para ver los servicios detectados y cambiar su
                      consentimiento por categoría o proveedor.
                    </p>

                    <button
                      type="button"
                      class="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                      @click="openCookieSettings"
                    >
                      Abrir configuración de cookies
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator />

          <section id="consentimiento" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">
              6. Consentimiento y configuración
            </h2>

            <p class="leading-relaxed text-muted-foreground">
              Al acceder por primera vez a la web se muestra un panel desde el que puede
              aceptar todas las cookies, rechazarlas o configurarlas por categorías.
            </p>

            <p class="leading-relaxed text-muted-foreground">
              Las cookies que no sean estrictamente necesarias no deben utilizarse antes
              de que el usuario haya prestado su consentimiento.
            </p>

            <p class="leading-relaxed text-muted-foreground">
              Puede retirar o modificar su consentimiento en cualquier momento. La
              retirada no afecta a la licitud del tratamiento realizado antes de modificar
              las preferencias.
            </p>

            <button
              type="button"
              class="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/25 hover:text-primary"
              @click="openCookieSettings"
            >
              <Settings2 class="size-4" aria-hidden="true" />
              Modificar preferencias
            </button>
          </section>

          <Separator />

          <section id="terceros" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">7. Cookies de terceros</h2>

            <p class="leading-relaxed text-muted-foreground">
              Algunos servicios integrados pueden almacenar o consultar información desde
              dominios externos a Repro Disseny.
            </p>

            <p class="leading-relaxed text-muted-foreground">
              Estos terceros son responsables de sus propias tecnologías y tratamientos.
              El panel de configuración identifica los proveedores actualmente
              incorporados y permite consultar su información de privacidad.
            </p>

            <p class="leading-relaxed text-muted-foreground">
              La disponibilidad, finalidad y duración de las cookies de terceros pueden
              cambiar cuando el proveedor actualiza sus servicios. Por este motivo, el
              inventario del panel de consentimiento constituye la relación más
              actualizada.
            </p>
          </section>

          <Separator />

          <section id="transferencias" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">
              8. Transferencias internacionales
            </h2>

            <p class="leading-relaxed text-muted-foreground">
              Algunos proveedores pueden tratar información desde países situados fuera
              del Espacio Económico Europeo.
            </p>

            <p class="leading-relaxed text-muted-foreground">
              Cuando resulte aplicable, dichos tratamientos deberán apoyarse en mecanismos
              reconocidos por la normativa, como decisiones de adecuación, cláusulas
              contractuales tipo u otras garantías válidas.
            </p>

            <p class="leading-relaxed text-muted-foreground">
              Puede consultar la identidad del proveedor y su documentación de privacidad
              desde el panel de configuración.
            </p>
          </section>

          <Separator />

          <section id="navegador" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">
              9. Configuración del navegador
            </h2>

            <p class="leading-relaxed text-muted-foreground">
              Además del panel de consentimiento, la mayoría de navegadores permiten
              consultar, bloquear o eliminar cookies desde sus opciones de privacidad y
              seguridad.
            </p>

            <p class="leading-relaxed text-muted-foreground">
              El bloqueo general de cookies puede impedir que algunas funciones de la web
              operen correctamente. La configuración del navegador no sustituye
              necesariamente a la retirada del consentimiento en el panel de la web.
            </p>
          </section>

          <Separator />

          <section id="actualizaciones" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">10. Actualizaciones</h2>

            <p class="leading-relaxed text-muted-foreground">
              Esta política podrá actualizarse cuando se incorporen o eliminen
              tecnologías, cambien las finalidades, se modifiquen los proveedores o
              resulte necesario adaptarla a cambios normativos.
            </p>

            <p class="leading-relaxed text-muted-foreground">
              Cuando se produzcan cambios relevantes en las finalidades o proveedores que
              requieran consentimiento, se solicitará al usuario que vuelva a revisar sus
              preferencias.
            </p>
          </section>

          <Separator />

          <section id="contacto" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">11. Contacto</h2>

            <Card class="border-primary/15 bg-primary/5">
              <CardContent class="space-y-4 p-5 md:p-6">
                <div class="flex items-start gap-3">
                  <ShieldCheck
                    class="mt-1 size-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />

                  <div class="space-y-3">
                    <p class="leading-relaxed text-muted-foreground">
                      Para consultas sobre esta política o sobre el tratamiento de datos
                      asociado a las cookies, puede contactar con:
                    </p>

                    <a
                      :href="`mailto:${controller.email}`"
                      class="inline-flex items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      <Mail class="size-4" aria-hidden="true" />
                      {{ controller.email }}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </article>
      </div>
    </div>
  </main>
</template>
