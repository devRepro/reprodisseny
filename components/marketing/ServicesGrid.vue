<script setup lang="ts">
  type Service = {
    title: string
    description: string
    iconSrc: string
  }
  
  const services: Service[] = [
    {
      title: "Diseño gráfico",
      description:
        "Si tienes una idea, pero no sabes por dónde empezar, ya sea una simple maquetación, una adaptación de un material existente o tan sólo revisar la preimpresión, nuestros diseñadores te ayudarán encantados.",
      iconSrc: "/img/icons/disseny.svg",
    },
    {
      title: "Impresión en pequeño y gran formato",
      description:
        "Utilizamos distintas técnicas, desde la impresión digital que permite la personalización de documentos a partir de BBDD hasta la impresión offset indicada para grandes tiradas y la impresión látex para soportes de grandes dimensiones.",
      iconSrc: "/img/icons/impressio.svg",
    },
    {
      title: "Acabados premium",
      description:
        "Producimos materiales de alta calidad gracias a acabados especiales como laminado soft touch, barniz selectivo, stamping, troquelados, relieves en seco, encuadernación con tapa dura, contracolados y muchos más.",
      iconSrc: "/img/icons/premium.svg",
    },
    {
      title: "Corte digital a la forma",
      description:
        "Disponemos de una mesa de corte digital Kongsberg con la que cortamos o fresamos a la forma con gran precisión, desde sólo una unidad, infinidad de materiales, vinilos, forex, nido de abeja, cartón pluma, etc.",
      iconSrc: "/img/icons/tall.svg",
    },
    {
      title: "Rotulación y montaje de vinilos",
      description:
        "Instalamos de forma profesional todo tipo de trabajos de rotulación y comunicación visual para oficinas, hoteles, ferias, fábricas, colegios, comercios, etc. Disponemos de montadores propios con gran experiencia.",
      iconSrc: "/img/icons/vinils.svg",
    },
    {
      title: "Logística - Distribución de tu pedido",
      description:
        "Nos encargamos de forma integral de las recogidas, manipulados, picking, embalajes, almacenaje y de la gestión de stocks. Realizamos entregas en menos de 24h. Distribución nacional e internacional.",
      iconSrc: "/img/icons/logistica.svg",
    },
  ]
  </script>
  
  <template>
    <section class="w-full bg-white">
      <div class="mx-auto w-full max-w-[1440px] px-5 py-10 md:px-[60px] xl:px-[120px]">
        <header class="w-full max-w-[1200px]">
          <h2
            class="w-full text-[#212121] font-semibold text-[30px] leading-[36px]
                   after:content-[''] after:block after:mt-6
                   after:h-px after:w-full after:bg-[#212121]"
          >
            Inspiramos confianza en las empresas a través de nuestros servicios
          </h2>
        </header>
  
        <div class="mt-[50px] grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-3 xl:gap-x-10 xl:gap-y-[50px]">
          <article v-for="(service, index) in services" :key="index" class="flex items-start gap-6">
            <div
              class="h-[100px] w-[100px] shrink-0 rounded-[12px] bg-[#DEF4FF]
                     flex items-center justify-center"
              aria-hidden="true"
            >
              <img
                :src="service.iconSrc"
                :alt="`Icono: ${service.title}`"
                class="h-25 w-25"
                loading="lazy"
                decoding="async"
              />
            </div>
  
            <div class="flex flex-col gap-2 min-w-0">
              <h3 class="m-0 text-[#212121] font-bold text-[20px] leading-[26px]">
                {{ service.title }}
              </h3>
              <p class="m-0 text-[#212121] font-normal text-[18px] leading-[25px]">
                {{ service.description }}
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  </template>
  