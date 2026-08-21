<template>
  <section
    class="home-section home-section--compact home-business-intro"
    aria-labelledby="home-business-intro-title"
  >
    <div class="home-section__inner">
      <div class="home-business-intro__layout">
        <div class="home-business-intro__content">
          <p class="section-eyebrow">Producción gráfica para empresas</p>

          <h2
            id="home-business-intro-title"
            class="section-title section-title--section section-title--ink home-business-intro__title"
          >
            Impresión digital, offset y gran formato para empresas en Barcelona
          </h2>

          <p class="home-business-intro__copy">
            En Repro Disseny ayudamos a empresas, marcas y equipos de marketing a
            producir materiales gráficos con criterio técnico y control de principio a
            fin. Combinamos impresión digital y offset con gran formato, vinilos, PLV y
            packaging para resolver proyectos corporativos, promocionales y de punto de
            venta.
          </p>

          <p class="home-business-intro__copy">
            Desde la preparación de archivos hasta los acabados, la instalación y la
            logística, coordinamos cada fase para simplificar la producción y asegurar
            plazos, calidad y una entrega bien resuelta.
          </p>
        </div>

        <nav
          class="home-business-intro__nav"
          aria-label="Soluciones de impresión destacadas"
        >
          <h3 class="section-title section-title--compact section-title--foreground">
            Soluciones destacadas
          </h3>

          <ul class="home-business-intro__links">
            <li>
              <NuxtLink
                to="/categorias/gran-formato"
                class="home-business-intro__link"
              >
                <span>Impresión en gran formato</span>
                <span class="home-business-intro__link-arrow" aria-hidden="true">
                  →
                </span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/categorias/adhesivos-personalizados"
                class="home-business-intro__link"
              >
                <span>Adhesivos personalizados</span>
                <span class="home-business-intro__link-arrow" aria-hidden="true">
                  →
                </span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/categorias/libros-revistas-catalogos"
                class="home-business-intro__link"
              >
                <span>Libros, revistas y catálogos</span>
                <span class="home-business-intro__link-arrow" aria-hidden="true">
                  →
                </span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/categorias/packaging"
                class="home-business-intro__link"
              >
                <span>Packaging personalizado</span>
                <span class="home-business-intro__link-arrow" aria-hidden="true">
                  →
                </span>
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>

      <ul
        class="home-business-intro__trust"
        aria-label="Fortalezas de Repro Disseny"
      >
        <li class="home-business-intro__trust-item">Desde 1983</li>
        <li class="home-business-intro__trust-item">Producción para empresas</li>
        <li class="home-business-intro__trust-item">Asesoramiento técnico</li>
        <li class="home-business-intro__trust-item">Instalación y logística</li>
      </ul>
    </div>
  </section>
</template>
