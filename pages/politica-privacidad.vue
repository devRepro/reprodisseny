<script setup lang="ts">
import { CalendarDays, Mail, MapPin, ShieldCheck } from "lucide-vue-next";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const sections = [
  { id: "introduccion", title: "1. Introducción" },
  { id: "responsable", title: "2. Responsable del tratamiento" },
  { id: "datos-recopilados", title: "3. Datos que recopilamos" },
  { id: "finalidad", title: "4. Finalidad del tratamiento" },
  { id: "base-legal", title: "5. Base legal del tratamiento" },
  { id: "conservacion", title: "6. Conservación de los datos" },
  { id: "cesion", title: "7. Cesión de datos a terceros" },
  { id: "transferencias", title: "8. Transferencias internacionales" },
  { id: "cookies", title: "9. Política de cookies" },
  { id: "derechos", title: "10. Derechos del usuario" },
  { id: "seguridad", title: "11. Seguridad de los datos" },
  { id: "cambios", title: "12. Cambios en esta política" },
  { id: "contacto", title: "13. Contacto" },
];

const lastUpdated = "24 de abril de 2026";

useSeoMeta({
  title: "Política de privacidad | Repro Disseny",
  description:
    "Consulta cómo Repro Disseny recopila, utiliza, conserva y protege tus datos personales conforme al RGPD y la LOPDGDD.",
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
            <ShieldCheck class="h-4 w-4" aria-hidden="true" />
            Protección de datos
          </div>

          <div class="space-y-4">
            <h1
              class="font-h1 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl"
            >
              Política de privacidad
            </h1>

            <p class="max-w-2xl text-lg leading-relaxed text-muted-foreground">
              En Repro Disseny nos comprometemos a proteger la privacidad de los
              usuarios y garantizar el cumplimiento de la normativa vigente en
              materia de protección de datos.
            </p>
          </div>

          <div class="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span class="inline-flex items-center gap-2">
              <CalendarDays class="h-4 w-4" aria-hidden="true" />
              Última actualización:
              <time datetime="2026-04-24">{{ lastUpdated }}</time>
            </span>

            <span class="inline-flex items-center gap-2">
              <Mail class="h-4 w-4" aria-hidden="true" />
              <a
                href="mailto:privacidad@reprodisseny.com"
                class="font-medium text-primary underline-offset-4 hover:underline"
              >
                privacidad@reprodisseny.com
              </a>
            </span>
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

                <nav aria-label="Índice de la política de privacidad">
                  <ol class="space-y-2">
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

        <article class="max-w-3xl space-y-10">
          <section id="introduccion" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">1. Introducción</h2>
            <p class="leading-relaxed text-muted-foreground">
              En Repro Disseny nos comprometemos a proteger la privacidad de los
              usuarios y garantizar el cumplimiento de la normativa vigente en
              materia de protección de datos, en particular el Reglamento (UE)
              2016/679, Reglamento General de Protección de Datos (RGPD), y la
              Ley Orgánica 3/2018, de Protección de Datos Personales y garantía
              de los derechos digitales (LOPDGDD).
            </p>
            <p class="leading-relaxed text-muted-foreground">
              Esta política describe cómo recopilamos, utilizamos y protegemos
              sus datos personales cuando interactúa con nuestro sitio web.
            </p>
          </section>

          <Separator />

          <section id="responsable" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">
              2. Responsable del tratamiento
            </h2>

            <Card class="border-border/60 bg-muted/30">
              <CardContent class="space-y-3 p-5 text-muted-foreground">
                <p>
                  <strong class="text-foreground">Titular:</strong>
                  Repro Disseny
                </p>
                <p>
                  <strong class="text-foreground">Email de contacto:</strong>
                  <a
                    href="mailto:privacidad@reprodisseny.com"
                    class="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    privacidad@reprodisseny.com
                  </a>
                </p>
                <p class="flex gap-2">
                  <MapPin class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    <strong class="text-foreground">Dirección:</strong>
                    Juan de Mena, 19 – 08035 Barcelona
                  </span>
                </p>
              </CardContent>
            </Card>
          </section>

          <Separator />

          <section id="datos-recopilados" class="scroll-mt-24 space-y-5">
            <h2 class="text-2xl font-bold tracking-tight">
              3. Datos que recopilamos
            </h2>
            <p class="leading-relaxed text-muted-foreground">
              Recopilamos datos personales que usted nos facilita directamente o
              que se generan automáticamente al usar la web.
            </p>

            <div class="grid gap-4 md:grid-cols-3">
              <Card class="border-border/60">
                <CardContent class="space-y-3 p-5">
                  <h3 class="font-semibold">Datos facilitados</h3>
                  <ul class="space-y-2 text-sm text-muted-foreground">
                    <li>Nombre y apellidos</li>
                    <li>Correo electrónico</li>
                    <li>Teléfono</li>
                    <li>Empresa, si aplica</li>
                    <li>Mensaje incluido en formularios</li>
                  </ul>
                </CardContent>
              </Card>

              <Card class="border-border/60">
                <CardContent class="space-y-3 p-5">
                  <h3 class="font-semibold">Datos de facturación</h3>
                  <ul class="space-y-2 text-sm text-muted-foreground">
                    <li>Dirección postal</li>
                    <li>NIF/CIF</li>
                  </ul>
                </CardContent>
              </Card>

              <Card class="border-border/60">
                <CardContent class="space-y-3 p-5">
                  <h3 class="font-semibold">Datos técnicos</h3>
                  <ul class="space-y-2 text-sm text-muted-foreground">
                    <li>Dirección IP</li>
                    <li>Tipo de navegador</li>
                    <li>Sistema operativo</li>
                    <li>Páginas visitadas y comportamiento en la web</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator />

          <section id="finalidad" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">
              4. Finalidad del tratamiento
            </h2>
            <p class="leading-relaxed text-muted-foreground">
              Tratamos sus datos para:
            </p>
            <ul class="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Atender solicitudes de contacto o presupuestos.</li>
              <li>Gestionar la relación comercial.</li>
              <li>Enviar comunicaciones relacionadas con sus solicitudes.</li>
              <li>
                Mejorar la experiencia de usuario y el rendimiento de la web.
              </li>
              <li>Cumplir obligaciones legales.</li>
            </ul>
          </section>

          <Separator />

          <section id="base-legal" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">
              5. Base legal del tratamiento
            </h2>
            <p class="leading-relaxed text-muted-foreground">
              El tratamiento de sus datos se basa en:
            </p>
            <ul class="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Consentimiento del usuario en formularios y cookies.</li>
              <li>Ejecución de un contrato o precontrato.</li>
              <li>Interés legítimo en la mejora del servicio y analítica web.</li>
              <li>Cumplimiento de obligaciones legales.</li>
            </ul>
          </section>

          <Separator />

          <section id="conservacion" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">
              6. Conservación de los datos
            </h2>
            <p class="leading-relaxed text-muted-foreground">
              Sus datos se conservarán:
            </p>
            <ul class="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Mientras exista una relación comercial o contractual.</li>
              <li>
                Durante el tiempo necesario para cumplir obligaciones legales.
              </li>
              <li>Hasta que solicite su supresión.</li>
            </ul>
          </section>

          <Separator />

          <section id="cesion" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">
              7. Cesión de datos a terceros
            </h2>
            <p class="leading-relaxed text-muted-foreground">
              No vendemos ni cedemos sus datos personales, salvo obligación legal
              o cuando sea necesario para prestar el servicio.
            </p>
            <p class="leading-relaxed text-muted-foreground">
              Podrán acceder a sus datos proveedores tecnológicos, servicios de
              hosting, herramientas de analítica, Microsoft 365, SharePoint y
              otros servicios necesarios para la operativa del sitio web.
            </p>
            <p class="leading-relaxed text-muted-foreground">
              Todos ellos actúan como encargados del tratamiento y cumplen con la
              normativa de protección de datos.
            </p>
          </section>

          <Separator />

          <section id="transferencias" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">
              8. Transferencias internacionales
            </h2>
            <p class="leading-relaxed text-muted-foreground">
              En caso de utilizar servicios fuera del Espacio Económico Europeo,
              por ejemplo herramientas cloud, se garantizarán las medidas
              adecuadas mediante cláusulas contractuales tipo u otros mecanismos
              legales.
            </p>
          </section>

          <Separator />

          <section id="cookies" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">
              9. Política de cookies
            </h2>
            <p class="leading-relaxed text-muted-foreground">
              Utilizamos cookies propias y de terceros para garantizar el
              funcionamiento técnico del sitio, analizar el comportamiento de
              navegación y mejorar la experiencia del usuario.
            </p>
            <p class="leading-relaxed text-muted-foreground">
              Puede consultar todos los detalles en nuestra Política de Cookies.
            </p>
          </section>

          <Separator />

          <section id="derechos" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">
              10. Derechos del usuario
            </h2>
            <p class="leading-relaxed text-muted-foreground">
              De acuerdo con el RGPD, usted tiene derecho a:
            </p>
            <ul class="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Acceder a sus datos personales.</li>
              <li>Rectificar datos inexactos.</li>
              <li>Solicitar su supresión.</li>
              <li>Limitar u oponerse al tratamiento.</li>
              <li>Solicitar la portabilidad de sus datos.</li>
            </ul>
            <p class="leading-relaxed text-muted-foreground">
              Puede ejercer estos derechos enviando un correo a
              <a
                href="mailto:privacidad@reprodisseny.com"
                class="font-medium text-primary underline-offset-4 hover:underline"
              >
                privacidad@reprodisseny.com </a
              >. También puede presentar una reclamación ante la Agencia Española
              de Protección de Datos (AEPD).
            </p>
          </section>

          <Separator />

          <section id="seguridad" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">
              11. Seguridad de los datos
            </h2>
            <p class="leading-relaxed text-muted-foreground">
              Aplicamos medidas técnicas y organizativas adecuadas para proteger
              sus datos frente a accesos no autorizados, pérdida o alteración.
            </p>
          </section>

          <Separator />

          <section id="cambios" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">
              12. Cambios en esta política
            </h2>
            <p class="leading-relaxed text-muted-foreground">
              Podemos actualizar esta política de privacidad para adaptarla a
              cambios legales o técnicos. La versión vigente estará siempre
              disponible en esta página.
            </p>
          </section>

          <Separator />

          <section id="contacto" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">13. Contacto</h2>
            <Card class="border-primary/15 bg-primary/5">
              <CardContent class="space-y-3 p-5">
                <p class="leading-relaxed text-muted-foreground">
                  Para cualquier consulta sobre esta política o sobre el
                  tratamiento de sus datos, puede contactar con nosotros en:
                </p>
                <a
                  href="mailto:privacidad@reprodisseny.com"
                  class="inline-flex items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline"
                >
                  <Mail class="h-4 w-4" aria-hidden="true" />
                  privacidad@reprodisseny.com
                </a>
              </CardContent>
            </Card>
          </section>
        </article>
      </div>
    </div>
  </main>
</template>