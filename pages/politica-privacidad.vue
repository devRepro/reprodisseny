<script setup lang="ts">
import { CalendarDays, Cookie, Mail, MapPin, Scale, ShieldCheck } from "lucide-vue-next";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type ProcessingActivity = {
  purpose: string;
  data: string;
  legalBasis: string;
  retention: string;
};

const controller = {
  legalName: "REPRO DISSENY, S.L.",
  tradeName: "Repro Disseny",
  nif: "B-64555105",
  address: "Calle Juan de Mena, 19, 08035 Barcelona",
  privacyEmail: "rgpd@reprodisseny.com",
};

const lastUpdated = {
  text: "13 de julio de 2026",
  datetime: "2026-07-13",
};

const sections = [
  { id: "responsable", title: "1. Responsable del tratamiento" },
  { id: "datos", title: "2. Datos personales tratados" },
  { id: "finalidades", title: "3. Finalidades y bases jurídicas" },
  { id: "conservacion", title: "4. Conservación de los datos" },
  { id: "destinatarios", title: "5. Destinatarios y proveedores" },
  { id: "transferencias", title: "6. Transferencias internacionales" },
  { id: "cookies", title: "7. Cookies y analítica" },
  { id: "derechos", title: "8. Derechos de las personas" },
  { id: "decisiones", title: "9. Decisiones automatizadas" },
  { id: "seguridad", title: "10. Seguridad" },
  { id: "cambios", title: "11. Cambios en la política" },
  { id: "contacto", title: "12. Contacto" },
];

const processingActivities: ProcessingActivity[] = [
  {
    purpose: "Responder consultas y solicitudes de presupuesto",
    data:
      "Nombre, empresa, correo electrónico, teléfono, mensaje, producto solicitado, cantidades, características y archivos aportados.",
    legalBasis:
      "Aplicación de medidas precontractuales solicitadas por la persona interesada.",
    retention:
      "Durante la gestión de la solicitud y, posteriormente, durante los plazos necesarios para atender posibles responsabilidades legales.",
  },
  {
    purpose: "Gestionar pedidos y relaciones comerciales",
    data:
      "Datos identificativos, de contacto, facturación, envío, pedido, producción y comunicaciones relacionadas.",
    legalBasis:
      "Ejecución de la relación contractual y cumplimiento de obligaciones legales.",
    retention:
      "Durante la relación comercial y durante los plazos legales aplicables en materia mercantil, fiscal y contable.",
  },
  {
    purpose: "Enviar comunicaciones relacionadas con una solicitud o pedido",
    data:
      "Nombre, empresa, dirección de correo electrónico, teléfono y datos de la solicitud.",
    legalBasis:
      "Ejecución de medidas precontractuales o contractuales e interés legítimo en mantener informada a la persona solicitante.",
    retention:
      "Mientras resulte necesario para gestionar la solicitud, pedido o servicio contratado.",
  },
  {
    purpose: "Enviar comunicaciones comerciales",
    data: "Nombre, empresa, correo electrónico y preferencias comerciales.",
    legalBasis:
      "Consentimiento de la persona interesada o relación contractual previa cuando la normativa lo permita.",
    retention:
      "Hasta que se retire el consentimiento o se ejerza el derecho de oposición.",
  },
  {
    purpose: "Garantizar la seguridad y el funcionamiento de la web",
    data:
      "Dirección IP, registros técnicos, navegador, dispositivo, sistema operativo y datos de seguridad.",
    legalBasis:
      "Interés legítimo en proteger el sitio web, prevenir abusos y garantizar su funcionamiento.",
    retention:
      "Durante el tiempo estrictamente necesario para gestionar la seguridad, diagnosticar incidencias y atender posibles responsabilidades.",
  },
  {
    purpose: "Medir el uso y rendimiento de la web",
    data:
      "Identificadores online y datos de navegación generados mediante cookies o tecnologías similares.",
    legalBasis:
      "Consentimiento otorgado mediante el gestor de cookies, salvo tecnologías estrictamente necesarias.",
    retention:
      "Según los periodos indicados en la Política de Cookies y en el panel de configuración de cookies.",
  },
];

const personalDataGroups = [
  {
    title: "Identificación y contacto",
    items: [
      "Nombre y apellidos",
      "Empresa",
      "Correo electrónico",
      "Teléfono",
      "Dirección postal",
      "NIF o CIF cuando sea necesario",
    ],
  },
  {
    title: "Solicitud y producción",
    items: [
      "Producto solicitado",
      "Cantidades y medidas",
      "Acabados y materiales",
      "Comentarios e instrucciones",
      "Archivos, diseños y documentos adjuntos",
    ],
  },
  {
    title: "Navegación y seguridad",
    items: [
      "Dirección IP",
      "Tipo de navegador y dispositivo",
      "Sistema operativo",
      "Registros técnicos",
      "Preferencias de cookies",
      "Datos de navegación cuando exista consentimiento",
    ],
  },
];

const rights = [
  "Acceso a sus datos personales.",
  "Rectificación de datos inexactos o incompletos.",
  "Supresión de sus datos cuando proceda.",
  "Oposición a determinados tratamientos.",
  "Limitación del tratamiento en los supuestos previstos legalmente.",
  "Portabilidad de los datos cuando resulte aplicable.",
  "Retirada del consentimiento en cualquier momento.",
  "No ser objeto de decisiones basadas únicamente en tratamientos automatizados cuando produzcan efectos jurídicos o similares.",
];

useSeoMeta({
  title: "Política de privacidad",
  description:
    "Consulta cómo Repro Disseny trata, conserva y protege los datos personales facilitados mediante su web y sus formularios.",
  ogTitle: "Política de privacidad | Repro Disseny",
  ogDescription:
    "Información sobre el tratamiento y la protección de datos personales en Repro Disseny.",
  robots: "index,follow",
});

useHead({
  link: [
    {
      rel: "canonical",
      href: "https://reprodisseny.com/politica-privacidad",
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
            <ShieldCheck class="size-4" aria-hidden="true" />
            Protección de datos
          </div>

          <div class="space-y-4">
            <h1 class="font-h1 text-4xl font-extrabold tracking-tight md:text-5xl">
              Política de privacidad
            </h1>

            <p class="max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Esta política explica qué datos personales trata Repro Disseny, para qué los
              utiliza, durante cuánto tiempo los conserva y cómo puede ejercer sus
              derechos.
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

            <span class="inline-flex items-center gap-2">
              <Mail class="size-4" aria-hidden="true" />

              <a
                :href="`mailto:${controller.privacyEmail}`"
                class="font-medium text-primary underline-offset-4 hover:underline"
              >
                {{ controller.privacyEmail }}
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
          <section id="responsable" class="scroll-mt-24 space-y-5">
            <h2 class="text-2xl font-bold tracking-tight">
              1. Responsable del tratamiento
            </h2>

            <p class="leading-relaxed text-muted-foreground">
              El responsable del tratamiento de los datos personales recogidos mediante
              este sitio web es:
            </p>

            <Card class="border-border/60 bg-muted/30">
              <CardContent class="space-y-3 p-5 text-muted-foreground">
                <p>
                  <strong class="text-foreground">Razón social:</strong>
                  {{ controller.legalName }}
                </p>

                <p>
                  <strong class="text-foreground">Nombre comercial:</strong>
                  {{ controller.tradeName }}
                </p>

                <p>
                  <strong class="text-foreground">NIF:</strong>
                  {{ controller.nif }}
                </p>

                <p class="flex items-start gap-2">
                  <MapPin class="mt-1 size-4 shrink-0" aria-hidden="true" />

                  <span>
                    <strong class="text-foreground">Domicilio:</strong>
                    {{ controller.address }}
                  </span>
                </p>

                <p>
                  <strong class="text-foreground">
                    Contacto de protección de datos:
                  </strong>

                  <a
                    :href="`mailto:${controller.privacyEmail}`"
                    class="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {{ controller.privacyEmail }}
                  </a>
                </p>
              </CardContent>
            </Card>
          </section>

          <Separator />

          <section id="datos" class="scroll-mt-24 space-y-5">
            <h2 class="text-2xl font-bold tracking-tight">
              2. Datos personales tratados
            </h2>

            <p class="leading-relaxed text-muted-foreground">
              Los datos tratados dependen de la relación que mantenga con nosotros y de
              los formularios o servicios que utilice.
            </p>

            <div class="grid gap-4 md:grid-cols-3">
              <Card
                v-for="group in personalDataGroups"
                :key="group.title"
                class="border-border/60"
              >
                <CardContent class="space-y-3 p-5">
                  <h3 class="font-semibold">
                    {{ group.title }}
                  </h3>

                  <ul
                    class="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground"
                  >
                    <li v-for="item in group.items" :key="item">
                      {{ item }}
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <p class="leading-relaxed text-muted-foreground">
              Los datos proceden principalmente de la propia persona interesada, de su
              empresa o representante y, cuando utiliza la web, de la información técnica
              generada por su dispositivo y navegador.
            </p>

            <p class="leading-relaxed text-muted-foreground">
              No solicitamos categorías especiales de datos personales. Le recomendamos no
              incluir información sensible en los mensajes, archivos o documentos
              enviados, salvo que resulte estrictamente necesaria.
            </p>
          </section>

          <Separator />

          <section id="finalidades" class="scroll-mt-24 space-y-5">
            <h2 class="text-2xl font-bold tracking-tight">
              3. Finalidades y bases jurídicas
            </h2>

            <div class="space-y-4">
              <Card
                v-for="activity in processingActivities"
                :key="activity.purpose"
                class="border-border/60"
              >
                <CardContent class="space-y-4 p-5 md:p-6">
                  <h3 class="text-lg font-semibold">
                    {{ activity.purpose }}
                  </h3>

                  <dl class="grid gap-4 text-sm md:grid-cols-3">
                    <div class="space-y-1">
                      <dt class="font-semibold text-foreground">Datos tratados</dt>
                      <dd class="leading-relaxed text-muted-foreground">
                        {{ activity.data }}
                      </dd>
                    </div>

                    <div class="space-y-1">
                      <dt class="font-semibold text-foreground">Base jurídica</dt>
                      <dd class="leading-relaxed text-muted-foreground">
                        {{ activity.legalBasis }}
                      </dd>
                    </div>

                    <div class="space-y-1">
                      <dt class="font-semibold text-foreground">Conservación</dt>
                      <dd class="leading-relaxed text-muted-foreground">
                        {{ activity.retention }}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator />

          <section id="conservacion" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">
              4. Conservación de los datos
            </h2>

            <p class="leading-relaxed text-muted-foreground">
              Los datos se conservarán mientras sean necesarios para la finalidad para la
              que fueron recogidos. Una vez finalizada la relación o atendida la
              solicitud, podrán mantenerse debidamente bloqueados durante los plazos
              exigidos por la normativa y mientras puedan derivarse responsabilidades
              legales.
            </p>

            <p class="leading-relaxed text-muted-foreground">
              Los datos utilizados para comunicaciones comerciales se conservarán hasta
              que retire su consentimiento o ejerza su derecho de oposición.
            </p>
          </section>

          <Separator />

          <section id="destinatarios" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">
              5. Destinatarios y proveedores
            </h2>

            <p class="leading-relaxed text-muted-foreground">
              No vendemos datos personales ni los cedemos a terceros para que los utilicen
              con finalidades propias ajenas a la relación mantenida con Repro Disseny.
            </p>

            <p class="leading-relaxed text-muted-foreground">
              Podrán acceder a los datos proveedores que prestan servicios de alojamiento,
              correo electrónico, gestión documental, CRM, almacenamiento, mantenimiento,
              seguridad, analítica, transporte o producción. Estos proveedores actúan como
              encargados del tratamiento y deben tratar los datos siguiendo nuestras
              instrucciones y las condiciones establecidas contractualmente.
            </p>

            <p class="leading-relaxed text-muted-foreground">
              Los datos también podrán comunicarse a administraciones públicas, juzgados,
              tribunales, entidades financieras u otros destinatarios cuando resulte
              necesario para cumplir una obligación legal, gestionar pagos o atender
              requerimientos legítimos.
            </p>
          </section>

          <Separator />

          <section id="transferencias" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">
              6. Transferencias internacionales
            </h2>

            <p class="leading-relaxed text-muted-foreground">
              Algunos proveedores tecnológicos pueden tratar datos desde países situados
              fuera del Espacio Económico Europeo. Cuando exista una transferencia
              internacional, se aplicarán las garantías reconocidas por la normativa, como
              decisiones de adecuación, cláusulas contractuales tipo u otros mecanismos
              legalmente válidos.
            </p>

            <p class="leading-relaxed text-muted-foreground">
              Puede solicitar información adicional sobre las garantías aplicadas
              escribiendo a
              <a
                :href="`mailto:${controller.privacyEmail}`"
                class="font-medium text-primary underline-offset-4 hover:underline"
              >
                {{ controller.privacyEmail }}</a
              >.
            </p>
          </section>

          <Separator />

          <section id="cookies" class="scroll-mt-24 space-y-4">
            <div class="flex items-start gap-3">
              <Cookie class="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />

              <div class="space-y-4">
                <h2 class="text-2xl font-bold tracking-tight">7. Cookies y analítica</h2>

                <p class="leading-relaxed text-muted-foreground">
                  La web utiliza tecnologías estrictamente necesarias para su
                  funcionamiento. Las cookies de medición, analítica, personalización o
                  marketing solo se utilizarán cuando haya prestado su consentimiento
                  mediante el panel de configuración.
                </p>

                <p class="leading-relaxed text-muted-foreground">
                  Puede consultar los proveedores, finalidades, duración y opciones de
                  configuración en la
                  <NuxtLink
                    to="/politica-cookies"
                    class="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Política de Cookies</NuxtLink
                  >.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          <section id="derechos" class="scroll-mt-24 space-y-4">
            <div class="flex items-start gap-3">
              <Scale class="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />

              <div class="space-y-4">
                <h2 class="text-2xl font-bold tracking-tight">
                  8. Derechos de las personas
                </h2>

                <p class="leading-relaxed text-muted-foreground">
                  Puede ejercer los siguientes derechos:
                </p>

                <ul class="list-disc space-y-2 pl-6 text-muted-foreground">
                  <li v-for="right in rights" :key="right">
                    {{ right }}
                  </li>
                </ul>

                <p class="leading-relaxed text-muted-foreground">
                  Para ejercerlos, envíe una solicitud a
                  <a
                    :href="`mailto:${controller.privacyEmail}`"
                    class="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {{ controller.privacyEmail }}
                  </a>
                  indicando el derecho que desea ejercer y la información necesaria para
                  identificar la solicitud. Cuando resulte necesario, podremos solicitar
                  documentación adicional para verificar su identidad.
                </p>

                <p class="leading-relaxed text-muted-foreground">
                  También puede presentar una reclamación ante la
                  <a
                    href="https://www.aepd.es"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Agencia Española de Protección de Datos
                  </a>
                  cuando considere que el tratamiento no se ajusta a la normativa.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          <section id="decisiones" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">9. Decisiones automatizadas</h2>

            <p class="leading-relaxed text-muted-foreground">
              Repro Disseny no adopta decisiones con efectos jurídicos o similares basadas
              únicamente en el tratamiento automatizado de datos personales ni realiza
              perfiles automatizados con ese tipo de efectos.
            </p>
          </section>

          <Separator />

          <section id="seguridad" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">10. Seguridad</h2>

            <p class="leading-relaxed text-muted-foreground">
              Aplicamos medidas técnicas y organizativas destinadas a proteger los datos
              frente a accesos no autorizados, pérdida, alteración, divulgación o
              destrucción, teniendo en cuenta la naturaleza de los datos y los riesgos
              asociados al tratamiento.
            </p>

            <p class="leading-relaxed text-muted-foreground">
              Ningún sistema puede garantizar una seguridad absoluta. Ante una incidencia
              de seguridad, se aplicarán los procedimientos internos y las obligaciones de
              comunicación previstas en la normativa.
            </p>
          </section>

          <Separator />

          <section id="cambios" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">11. Cambios en la política</h2>

            <p class="leading-relaxed text-muted-foreground">
              Esta política podrá actualizarse para reflejar modificaciones legales,
              técnicas o en los tratamientos realizados. La versión vigente y su fecha de
              actualización estarán disponibles en esta misma página.
            </p>
          </section>

          <Separator />

          <section id="contacto" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">12. Contacto</h2>

            <Card class="border-primary/15 bg-primary/5">
              <CardContent class="space-y-4 p-5 md:p-6">
                <p class="leading-relaxed text-muted-foreground">
                  Para consultas relacionadas con esta política o con el tratamiento de
                  sus datos personales, puede contactar con:
                </p>

                <div class="space-y-2">
                  <p class="font-semibold text-foreground">
                    {{ controller.legalName }}
                  </p>

                  <p class="text-muted-foreground">
                    {{ controller.address }}
                  </p>

                  <a
                    :href="`mailto:${controller.privacyEmail}`"
                    class="inline-flex items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    <Mail class="size-4" aria-hidden="true" />
                    {{ controller.privacyEmail }}
                  </a>
                </div>
              </CardContent>
            </Card>
          </section>
        </article>
      </div>
    </div>
  </main>
</template>
