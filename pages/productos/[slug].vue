<template>
  <main class="bg-white min-h-screen">
    <nav class="border-b border-slate-100 bg-slate-50/50">
      <div :class="containerClass" class="py-4">
        <SiteBreadcrumbs :items="breadcrumbItems" :auto="false" />
      </div>
    </nav>

    <div v-if="pending" class="flex items-center justify-center min-h-[40vh]">
      <div class="animate-pulse text-slate-400 font-medium">
        Cargando detalles del producto...
      </div>
    </div>

    <template v-else-if="product">
      <section :class="containerClass" class="pt-8 md:pt-16">
        <div class="grid lg:grid-cols-2 gap-12 items-start">
          <ProductHero :product="product" :category="category" />

          <div class="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 class="text-xl font-bold text-slate-900 mb-2">
              Solicitar presupuesto personalizado
            </h3>
            <p class="text-sm text-slate-600 mb-6">
              Cuéntanos qué necesitas y nuestros expertos te responderán en menos de 24h.
            </p>

            <div class="space-y-4">
              <div class="flex items-center gap-3 text-sm text-slate-700">
                <div
                  class="h-5 w-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    />
                  </svg>
                </div>
                Revisión de archivos incluida
              </div>
              <button
                class="w-full bg-sky-700 hover:bg-sky-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-sky-200"
              >
                Configurar mi {{ product.title }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-16 md:mt-24">
        <div :class="containerClass">
          <GuideBanner
            bg-image-src="/img/ui/archivos.png"
            title="¿No estás seguro de las medidas?"
            subtitle="Nuestro equipo técnico revisa cada solicitud para asegurar que el resultado sea perfecto."
            cta-text="Consultar Guía"
            to="/guia-impresion"
          />
        </div>
      </section>

      <section
        id="detalles"
        class="mt-20 md:mt-32 bg-slate-50/50 py-20 border-y border-slate-100"
      >
        <div :class="containerClass">
          <div :class="contentNarrowClass">
            <h2 class="text-3xl font-bold text-slate-900 mb-10 text-center">
              Especificaciones Técnicas
            </h2>
            <ProductDetails :tabs="detailsTabs" />
          </div>
        </div>
      </section>

      <section class="py-20">
        <div :class="containerClass">
          <div :class="contentNarrowClass">
            <h2 class="text-2xl font-bold text-slate-900 mb-8 text-center">
              Dudas frecuentes
            </h2>
            <ProductFaq :faqs="faqs" />
          </div>
        </div>
      </section>

      <section class="bg-sky-900 py-16 text-center text-white">
        <div class="px-6">
          <h2 class="text-3xl font-bold">¿Tienes un proyecto especial?</h2>
          <p class="mt-4 text-sky-100 opacity-80 max-w-xl mx-auto">
            Si no encuentras lo que buscas en los detalles, contáctanos directamente y lo
            fabricaremos a medida.
          </p>
          <button
            class="mt-8 bg-white text-sky-900 px-10 py-4 rounded-full font-bold hover:bg-sky-50 transition-colors"
          >
            Contactar con un asesor
          </button>
        </div>
      </section>
    </template>
  </main>
</template>
