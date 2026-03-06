<script setup lang="ts">
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// Índice de navegación para generar el menú lateral y las secciones
const sections = [
  { id: "introduccion", title: "1. Introducción" },
  { id: "datos-recopilados", title: "2. Datos que recopilamos" },
  { id: "uso-datos", title: "3. Uso de sus datos" },
  { id: "cookies", title: "4. Política de Cookies" },
  { id: "derechos", title: "5. Sus derechos" },
  { id: "contacto", title: "6. Contacto" },
]

// Fecha de última actualización dinámica o estática (SEO)
const lastUpdated = "15 de mayo de 2024"
</script>

<template>
  <main class="min-h-screen bg-background text-foreground py-12 px-6 lg:py-20">
    <div class="mx-auto max-w-[1200px]">
      <header class="mb-12 max-w-3xl">
        <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-primary mb-4">
          Política de Privacidad
        </h1>
        <p class="text-lg text-muted-foreground">
          En Repro Disseny valoramos su privacidad. Este documento explica cómo recopilamos, 
          utilizamos y protegemos su información personal.
        </p>
        <div class="mt-6 flex items-center text-sm text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>Última actualización: <time :datetime="lastUpdated">{{ lastUpdated }}</time></span>
        </div>
      </header>

      <Separator class="mb-12" />

      <div class="flex flex-col lg:flex-row gap-12 relative">
        
        <aside class="lg:w-1/4 hidden lg:block">
          <div class="sticky top-24">
            <Card class="border-border/50 shadow-sm bg-muted/30">
              <CardContent class="p-6">
                <h3 class="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
                  En esta página
                </h3>
                <nav aria-label="Índice de Política de Privacidad">
                  <ul class="space-y-3">
                    <li v-for="item in sections" :key="item.id">
                      <a 
                        :href="`#${item.id}`" 
                        class="text-sm text-foreground/80 hover:text-primary transition-colors hover:underline decoration-primary/30 underline-offset-4"
                      >
                        {{ item.title }}
                      </a>
                    </li>
                  </ul>
                </nav>
              </CardContent>
            </Card>
          </div>
        </aside>

        <article class="lg:w-3/4 max-w-3xl space-y-12">
          
          <section id="introduccion" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight text-foreground">1. Introducción</h2>
            <p class="text-muted-foreground leading-relaxed">
              Bienvenido a Repro Disseny. Nos comprometemos a proteger su información personal 
              y su derecho a la privacidad. Si tiene alguna pregunta o inquietud sobre nuestra 
              política o nuestras prácticas con respecto a su información personal, comuníquese 
              con nosotros a través de los canales oficiales.
            </p>
          </section>

          <section id="datos-recopilados" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight text-foreground">2. Datos que recopilamos</h2>
            <p class="text-muted-foreground leading-relaxed">
              Recopilamos la información personal que usted nos proporciona voluntariamente al 
              registrarse en el sitio web, expresar un interés en obtener información sobre 
              nosotros o nuestros productos y servicios.
            </p>
            <ul class="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Datos de contacto:</strong> Nombre, dirección de correo electrónico y número de teléfono.</li>
              <li><strong>Datos de facturación:</strong> Dirección física y NIF/CIF.</li>
              <li><strong>Datos técnicos:</strong> Dirección IP, tipo de navegador y sistema operativo.</li>
            </ul>
          </section>

          <section id="uso-datos" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight text-foreground">3. Uso de sus datos</h2>
            <p class="text-muted-foreground leading-relaxed">
              Procesamos su información para fines basados en intereses comerciales legítimos, 
              el cumplimiento de nuestro contrato con usted, el cumplimiento de nuestras obligaciones 
              legales y su consentimiento.
            </p>
          </section>

          <section id="cookies" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight text-foreground">4. Política de Cookies</h2>
            <p class="text-muted-foreground leading-relaxed">
              Podemos utilizar cookies y tecnologías de seguimiento similares (como balizas web y píxeles) 
              para acceder o almacenar información. La información específica sobre cómo usamos dichas 
              tecnologías se establece en nuestra Política de Cookies separada.
            </p>
          </section>

          <section id="derechos" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight text-foreground">5. Sus derechos</h2>
            <p class="text-muted-foreground leading-relaxed">
              De acuerdo con el Reglamento General de Protección de Datos (RGPD), usted tiene derecho a:
            </p>
            <ul class="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Acceder a sus datos personales.</li>
              <li>Solicitar la rectificación de datos inexactos.</li>
              <li>Solicitar la eliminación de sus datos (derecho al olvido).</li>
              <li>Oponerse al procesamiento de su información.</li>
            </ul>
          </section>

          <section id="contacto" class="scroll-mt-24 space-y-4">
            <h2 class="text-2xl font-bold tracking-tight text-foreground">6. Contacto</h2>
            <p class="text-muted-foreground leading-relaxed">
              Si tiene preguntas o comentarios sobre esta política, puede enviarnos un correo electrónico a 
              <a href="mailto:privacidad@reprodisseny.com" class="font-medium text-primary hover:underline">privacidad@reprodisseny.com</a> 
              o por correo postal a nuestras instalaciones principales.
            </p>
          </section>

        </article>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Transiciones suaves para el scroll */
html {
  scroll-behavior: smooth;
}
</style>