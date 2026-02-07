<!-- pages/sobre-nosotros.vue -->
<script setup lang="ts">
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-vue-next";

type TimelineItem = {
  year: string;
  title: string;
  text: string;
  imageAlt: string;
  side: "left" | "right";
};

const timeline: TimelineItem[] = [
  {
    year: "1995",
    title: "Lorem ipsum dolor sit",
    text:
      "Lorem ipsum dolor sit amet consectetur. Vitae elementum elementum sit a lacus vitae consectetur consectetur. Aliquam id porta sit aliquam donec fermentum augue. Sagittis dictum lectus tellus sit massa fusce sed sapien.",
    imageAlt: "Imatge històrica 1995",
    side: "right",
  },
  {
    year: "2005",
    title: "Lorem ipsum dolor sit",
    text:
      "Lorem ipsum dolor sit amet consectetur. Vitae elementum elementum sit a lacus vitae consectetur consectetur. Aliquam id porta sit aliquam donec fermentum augue. Sagittis dictum lectus tellus sit massa fusce sed sapien. Pellentesque auctor fames quam commodo rhoncus id.",
    imageAlt: "Imatge històrica 2005",
    side: "left",
  },
  {
    year: "2015",
    title: "Lorem ipsum dolor sit",
    text:
      "Lorem ipsum dolor sit amet consectetur. Vitae elementum elementum sit a lacus vitae consectetur consectetur. Aliquam id porta sit aliquam donec fermentum augue. Sagittis dictum lectus tellus sit massa fusce sed sapien. Pellentesque auctor fames.",
    imageAlt: "Imatge històrica 2015",
    side: "right",
  },
  {
    year: "2025",
    title: "Lorem ipsum dolor sit",
    text:
      "Lorem ipsum dolor sit amet consectetur. Vitae elementum elementum sit a lacus vitae consectetur consectetur. Aliquam id porta sit aliquam donec fermentum augue. Sagittis dictum lectus tellus sit massa fusce sed sapien.",
    imageAlt: "Imatge històrica 2025",
    side: "left",
  },
];

const compareHead = [
  "Impremtes online",
  "Impremtes tradicionals",
  "Repro Disseny",
] as const;
const compareRows = [
  {
    label: "Preus baixos en productes estandarditzats",
    online: true,
    traditional: false,
    repro: true,
  },
  {
    label: "Flexibilitat i llibertat a l’hora de fer la comanda",
    online: true,
    traditional: false,
    repro: true,
  },
  { label: "Qualitat del producte", online: false, traditional: true, repro: true },
  { label: "Experiència i assessorament", online: false, traditional: true, repro: true },
  {
    label: "Gestió del color + control individual del treball",
    online: false,
    traditional: false,
    repro: true,
  },
  {
    label: "Forma de pagament personalitzada",
    online: false,
    traditional: false,
    repro: true,
  },
  {
    label: "Enviaments i distribució segons necessitats",
    online: true,
    traditional: false,
    repro: true,
  },
  {
    label: "Seguretat i comoditat a l’hora de fer la comanda",
    online: true,
    traditional: true,
    repro: true,
  },
];

const values = [
  "Lorem ipsum",
  "Lorem ipsum",
  "Lorem ipsum",
  "Lorem ipsum",
  "Lorem ipsum",
  "Lorem ipsum",
];

const clients = [
  { name: "Client 1", src: "" },
  { name: "Client 2", src: "" },
  { name: "Client 3", src: "" },
  { name: "Client 4", src: "" },
  { name: "Client 5", src: "" },
  { name: "Client 6", src: "" },
  { name: "Client 7", src: "" },
  { name: "Client 8", src: "" },
  { name: "Client 9", src: "" },
  { name: "Client 10", src: "" },
  { name: "Client 11", src: "" },
  { name: "Client 12", src: "" },
];

// Si tu header está fixed/absolute, esto evita solapamientos.
// Ajusta si tu layout ya empuja el contenido.
const HEADER_OFFSET_PX = 141;
</script>

<template>
  <main class="bg-white text-[#1E1E1E]" :style="{ paddingTop: `${HEADER_OFFSET_PX}px` }">
    <!-- CLAIM -->
    <section class="w-full bg-[#DEF4FF]">
      <div class="mx-auto max-w-[1200px] px-6 xl:px-0 py-[50px]">
        <h1
          class="text-center font-['Figtree'] font-semibold text-[30px] leading-[36px] text-[#004F78]"
        >
          Tota una vida imprimint
        </h1>
      </div>
    </section>

    <!-- CRONOGRAMA (timeline alternado) -->
    <section class="mx-auto max-w-[1200px] px-6 xl:px-0 py-20">
      <div class="relative">
        <!-- línea central -->
        <div
          class="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-full w-px bg-[#3F3F3F]"
        />

        <div class="space-y-14">
          <div
            v-for="(it, idx) in timeline"
            :key="idx"
            class="grid grid-cols-1 md:grid-cols-2 items-center gap-10"
          >
            <!-- LEFT -->
            <div
              class="flex"
              :class="
                it.side === 'left'
                  ? 'md:justify-end md:order-1'
                  : 'md:justify-end md:order-2'
              "
            >
              <Card class="w-full max-w-[520px] border-0 shadow-none">
                <CardContent class="p-0">
                  <h3
                    class="font-['Figtree'] font-normal text-[40px] leading-[52px] text-[#1E1E1E]"
                    :class="it.side === 'left' ? 'text-right' : 'text-left'"
                  >
                    {{ it.year }} {{ it.title }}
                  </h3>
                  <p
                    class="mt-6 font-['Figtree'] font-normal text-[16px] leading-[22px] text-[#1E1E1E]"
                    :class="it.side === 'left' ? 'text-right' : 'text-left'"
                  >
                    {{ it.text }}
                  </p>
                </CardContent>
              </Card>
            </div>

            <!-- RIGHT (imagen) -->
            <div
              class="flex"
              :class="
                it.side === 'left'
                  ? 'md:justify-start md:order-2'
                  : 'md:justify-start md:order-1'
              "
            >
              <!-- Placeholder con tamaños tipo Figma (245px alto) -->
              <div
                class="w-full max-w-[520px] h-[245px] rounded-[12px] bg-[#D9D9D9]"
                role="img"
                :aria-label="it.imageAlt"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- VIDEO -->
    <section class="w-full bg-[#004F78]">
      <div
        class="mx-auto max-w-[1200px] px-6 xl:px-0 py-16 flex flex-col items-center gap-8"
      >
        <h2
          class="w-full text-center font-['Figtree'] font-semibold text-[30px] leading-[36px] text-white"
        >
          Algunes dades sobre l’empresa
        </h2>

        <!-- ratio similar a 746x416 -->
        <div class="w-full max-w-[746px] rounded-[12px] overflow-hidden bg-[#D9D9D9]">
          <div class="aspect-[746/416] w-full" />
          <!-- Sustituye esto por:
               - <NuxtImg .../>
               - o <iframe .../>
          -->
        </div>
      </div>
    </section>

    <!-- LO QUE NOS DIFERENCIA -->
    <section class="mx-auto max-w-[1200px] px-6 xl:px-0 py-20">
      <div class="flex flex-col gap-10">
        <div class="flex flex-col gap-6">
          <h2
            class="font-['Figtree'] font-semibold text-[30px] leading-[36px] text-[#1E1E1E]"
          >
            El que ens diferencia
          </h2>
          <p class="font-['Inter'] font-normal text-[18px] leading-[22px] text-[#1E1E1E]">
            Lorem ipsum dolor sit amet consectetur. Et adipiscing ac nunc consectetur
            integer eu lorem. In euismod urna tempor nunc augue sed. Dictum bibendum
            tincidunt et curabitur egestas. Commodo potenti viverra convallis lacus at
            nisi.
          </p>
        </div>

        <div class="relative">
          <!-- “columna” destacada para Repro (solo desktop) -->
          <div
            class="hidden lg:block absolute right-0 top-[56px] h-[calc(100%-56px)] w-[140px] bg-[#DEF4FF]"
          />

          <!-- Header -->
          <div class="hidden lg:grid grid-cols-[1fr_141px_199px_122px] items-end gap-10">
            <div />
            <div
              class="text-right font-['Inter'] text-[18px] leading-[22px] text-[#1E1E1E]"
            >
              {{ compareHead[0] }}
            </div>
            <div
              class="text-right font-['Inter'] text-[18px] leading-[22px] text-[#1E1E1E]"
            >
              {{ compareHead[1] }}
            </div>
            <div
              class="text-right font-['Inter'] text-[18px] leading-[22px] text-[#1E1E1E]"
            >
              {{ compareHead[2] }}
            </div>
          </div>

          <Separator class="my-4 bg-[#1E1E1E]" />

          <!-- Rows -->
          <div class="divide-y divide-[#1E1E1E]">
            <div v-for="(r, i) in compareRows" :key="i" class="py-4">
              <!-- Desktop -->
              <div
                class="hidden lg:grid grid-cols-[1fr_141px_199px_122px] items-center gap-10"
              >
                <div class="font-['Inter'] text-[18px] leading-[22px] text-[#1E1E1E]">
                  {{ r.label }}
                </div>

                <div class="flex justify-center">
                  <Check v-if="r.online" class="h-6 w-6 text-[#004F78]" />
                </div>
                <div class="flex justify-center">
                  <Check v-if="r.traditional" class="h-6 w-6 text-[#004F78]" />
                </div>
                <div class="flex justify-center">
                  <Check v-if="r.repro" class="h-6 w-6 text-[#004F78]" />
                </div>
              </div>

              <!-- Mobile -->
              <div class="lg:hidden">
                <div class="font-['Inter'] text-[16px] leading-[22px] text-[#1E1E1E]">
                  {{ r.label }}
                </div>
                <div class="mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div class="flex items-center gap-2">
                    <Check v-if="r.online" class="h-5 w-5 text-[#004F78]" />
                    <span>{{ compareHead[0] }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Check v-if="r.traditional" class="h-5 w-5 text-[#004F78]" />
                    <span>{{ compareHead[1] }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Check v-if="r.repro" class="h-5 w-5 text-[#004F78]" />
                    <span>{{ compareHead[2] }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- VALORES -->
    <section class="mx-auto max-w-[1200px] px-6 xl:px-0 pb-24">
      <h2
        class="font-['Figtree'] font-semibold text-[30px] leading-[36px] text-[#1E1E1E]"
      >
        Els nostres valors
      </h2>

      <div class="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10">
        <div v-for="(v, i) in values" :key="i" class="flex flex-col items-center gap-6">
          <div class="h-[97px] w-[97px] rounded-full border border-[#3F3F3F]" />
          <div
            class="text-center font-['Inter'] font-bold text-[18px] leading-[22px] text-[#1E1E1E]"
          >
            {{ v }}
          </div>
        </div>
      </div>
    </section>

    <!-- CLIENTES -->
    <section class="w-full bg-[#FFF7E8]">
      <div class="mx-auto max-w-[1200px] px-6 xl:px-0 py-16">
        <h2
          class="text-center font-['Figtree'] font-semibold text-[30px] leading-[36px] text-[#212121]"
        >
          Clients que confien en nosaltres
        </h2>

        <div
          class="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
        >
          <div
            v-for="c in clients"
            :key="c.name"
            class="h-[56px] rounded-md bg-white/60 border border-[#D5C3A0] flex items-center justify-center"
          >
            <span class="font-['Figtree'] text-xs text-[#212121]">{{ c.name }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- MEDIO AMBIENTE -->
    <section
      class="w-full"
      :style="{
        backgroundImage:
          'linear-gradient(0deg, rgba(3, 65, 55, 0.5), rgba(3, 65, 55, 0.5)), url(/img/medio-ambiente.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }"
    >
      <div class="mx-auto max-w-[900px] px-6 xl:px-0 py-24">
        <div class="flex flex-col items-center gap-10">
          <h2
            class="text-center font-['Figtree'] font-semibold text-[30px] leading-[36px] text-white"
          >
            Compromesos amb el medi ambient
          </h2>

          <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-10">
            <div class="space-y-5">
              <div
                class="text-center font-['Figtree'] font-semibold text-[20px] leading-[26px] text-white"
              >
                Lorem ipsum dolor sit amet consectetur.
              </div>
              <div
                class="text-center font-['Figtree'] font-semibold text-[20px] leading-[26px] text-white"
              >
                Lorem ipsum dolor sit amet consectetur.
              </div>
              <div
                class="text-center font-['Figtree'] font-semibold text-[20px] leading-[26px] text-white"
              >
                Lorem ipsum dolor sit amet consectetur.
              </div>
            </div>

            <div class="space-y-5">
              <div
                class="text-center font-['Figtree'] font-semibold text-[20px] leading-[26px] text-white"
              >
                Lorem ipsum dolor sit amet consectetur.
              </div>
              <div
                class="text-center font-['Figtree'] font-semibold text-[20px] leading-[26px] text-white"
              >
                Lorem ipsum dolor sit amet consectetur.
              </div>
              <div
                class="text-center font-['Figtree'] font-semibold text-[20px] leading-[26px] text-white"
              >
                Lorem ipsum dolor sit amet consectetur.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
