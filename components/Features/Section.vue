<template>
    <section class="py-20 px-6 bg-white">
      <div class="max-w-6xl mx-auto space-y-16">
        <div
          v-for="(item, index) in motivos"
          :key="index"
          class="flex flex-col md:flex-row items-center gap-6"
        >
          <!-- Imagen a la izquierda -->
          <div
            class="w-full md:w-[40%] h-[250px] rounded-lg bg-cover bg-center shadow-md"
            :style="`background-image: url(${item.img})`"
          />
  
          <!-- Texto a la derecha -->
          <div class="w-full md:w-[60%]">
            <h3 class="text-2xl font-bold text-[#1a78b3] mb-3">{{ item.title }}</h3>
            <div class="text-gray-700 space-y-3 text-sm leading-relaxed" v-html="item.description"></div>
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script setup lang="ts">
  const motivos = [
    {
      title: 'Impresión digital personalizada',
      img: '/img/servicios/impresion-digital.webp',
      description: `
        <p>Impresión ágil y de alta calidad para tiradas cortas y personalizadas. Perfecta para promociones, eventos y productos exclusivos con una rápida entrega.</p>
        <p>Ideal para imprimir lo que necesites con calidad profesional sin necesidad de grandes cantidades.</p>
      `
    },
    {
      title: 'Impresión offset de alto volumen',
      img: '/img/servicios/impresion-offset.webp',
      description: `
        <p>Alta fidelidad de color y excelente calidad en grandes tiradas. Nuestra impresión offset es ideal para catálogos, revistas, folletos y material corporativo.</p>
        <p>Opta por la mejor relación calidad/precio cuando necesitas imprimir a gran escala.</p>
      `
    },
    {
      title: 'Gran formato e instalación profesional',
      img: '/img/servicios/gran-formato.webp',
      description: `
        <p>Diseñamos, imprimimos e instalamos vinilos, lonas, expositores y todo tipo de soportes publicitarios de gran formato.</p>
        <p>Nos encargamos del montaje para que no tengas que preocuparte por nada.</p>
      `
    }
  ]
  </script>