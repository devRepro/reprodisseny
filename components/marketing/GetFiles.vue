<script setup lang="ts">
// Importamos el botón de shadcn (ajusta la ruta según tu estructura)
import { Button } from '@/components/ui/button'
</script>

<template>
  <section className="w-full bg-[#004b6b] py-16 px-4 flex justify-center items-center">
    <div className="max-w-5xl w-full flex flex-col md:flex-row items-center gap-10">
      
      <div className="w-full md:w-1/2">
        <NuxtImg
          src="/img/ui/contact.png"
          alt="Pide tu presupuesto"
          width="450"
          height="300"
          format="webp"
          fit="cover"
          className="rounded-2xl w-full h-[320px] object-cover shadow-lg"
          loading="lazy"
        />
      </div>

      <div className="w-full md:w-1/2 text-white space-y-6">
        <h2 className="text-3xl font-semibold tracking-tight">
          Pide tu presupuesto
        </h2>
        <p className="text-sm leading-relaxed text-slate-200 max-w-md">
          Lorem ipsum dolor sit amet consectetur. Et adipiscing ac nunc
          consectetur integer eu lorem. In euismod urna tempor nunc
          augue sed. Dictum bibendum tincidunt et curabitur egestas.
        </p>
        
        <Button 
          variant="secondary" 
          className="bg-[#dcf2f9] text-[#004b6b] hover:bg-white font-medium px-6 py-2 h-auto rounded-lg"
        >
          Pide tu presupuesto
        </Button>
      </div>

    </div>
  </section>
</template>