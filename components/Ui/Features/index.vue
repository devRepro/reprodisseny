<template>
    <div class="bg-white py-24 sm:py-32">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-2xl lg:text-center">
          <h2 class="text-base/7 font-semibold text-indigo-600">Deploy faster</h2>
          <p class="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl lg:text-balance">
            Servicios disponibles de impresión digital, offset y gran formato
          </p>
          <p class="mt-6 text-lg/8 text-gray-600">
            Impresión profesional de alta calidad en todos los formatos. Soluciones rápidas y personalizadas para empresas y creativos.
          </p>
        </div>
        <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-6xl">
          <!-- Cambiamos a 3 columnas en pantallas grandes -->
          <dl class="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            <div v-for="feature in features" :key="feature.name" class="relative pl-16">
              <dt class="text-base/7 font-semibold text-gray-900">
                <div class="absolute top-0 left-0 flex size-12 items-center justify-center rounded-lg">
                  <!-- Se asegura de que la imagen del icono se cargue correctamente -->
                  <img :src="feature.icon" alt="Icono" class="w-16 h-16 object-contain text-white" />
                </div>
                {{ feature.name }}
              </dt>
              <dd class="mt-2 text-base/7 text-gray-600">{{ feature.description }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const features = [
    {
      name: 'Diseño gráfico',
      description:
        'Si tienes una idea pero no sabes por dónde empezar, ya sea una simple maquetación, una adaptación de un material existente o un nuevo proyecto, nuestros diseñadores te ayudarán encantados.',
      icon: '/img/servicios/diseno.png',
    },
    {
      name: 'Rotulación y montaje de vinilos',
      description:
        'Instalamos de forma profesional todo tipo de trabajos de rotulación y comunicación visual en oficinas, hoteles, ferias, fábricas, colegios, comercios, etc... Servicio limitado a Cataluña. Otras zonas consultar.',
      icon: '/img/servicios/rotulacion.png',
    },
    {
      name: 'Personalización con datos variables',
      description:
        'Somos especialistas en impresión digital para personalizar documentos a partir de bases de datos (Excel, Access). Desde datos alfanuméricos (nombres, preferencias, categorías, idiomas, etc.) hasta códigos de barras, QR o imágenes personalizadas.',
      icon: '/img/servicios/variable.png',
    },
    {
      name: 'Logística – Distribución de tu pedido',
      description:
        'Nos encargamos de forma integral de las recogidas, manipulados, picking, embalajes, almacenaje y de la gestión de estocs. Realizamos entregas en menos de 24h.Distribución nacional e internacional',
      icon: '/img/servicios/logistica.png',
    },
    {
      name: 'Acabados premium',
      description:
        'Creamos materiales de alta calidad gracias a acabados especiales como el laminado soft touch, barniz selectivo, stamping, troquelados, relieves en seco, encuadernación con tapa dura, contracolados y muchos más.',
      icon: '/img/servicios/premium.png',
    },
    {
      name: 'Corte a la forma',
      description:
        'Disponemos de una mesa de corte digital Kongsberg con la que cortamos a la forma desde solo 1 unidad, prácticamente cualquier material; cartón pluma, metacrilato, Dibond, etc.',
      icon: '/img/servicios/corte.png',
    },
    {
      name: 'Web to print a medida para imprenta digital',
      description:
        'Creamos espacios webs personalizados de impresión digital para que las empresas puedan gestionar, compartir e imprimir digitalmente online sus documentos corporativos con tiradas cortas. Si quieres ver una demo contacta con nosotros.',
      icon: '/img/servicios/web2print.png',
    },
    {
      name: 'Pedidos grandes cantidades - offset',
      description:
        'La impresión offset es el sistema de impresión más adecuado y económico para tiradas largas. Indicado si necesitas imprimir una cantidad grande de un material de pequeño formato: flyers, catálogos, libros…,',
      icon: '/img/servicios/offset.png',
    },
    {
      name: 'Merchandising',
      description:
        'Dominamos la mayoría de las técnicas de personalización: sublimación, serigrafía, tampografía, bordados… Fabricamos y comercializamos todo tipo de artículos publicitarios con la calidad que esperas al mejor precio.',
      icon: '/img/servicios/merchardising.png',
    },
  ]
  </script>
  