<script setup lang="ts">
import { Button } from "@/components/ui/button"
import { NuxtLink } from "#components"
</script>

<template>
  <section class="w-full bg-[#004F78] py-16">
    <div class="mx-auto max-w-[1440px] px-6 md:px-20">
      <div
        class="grid items-center gap-y-10 md:grid-cols-[690px_1fr] md:gap-x-14"
      >
        <!-- Imagen -->
        <div class="overflow-hidden rounded-3xl">
          <NuxtImg
            src="/img/ui/contact.png"
            alt="Pide tu presupuesto"
            width="690"
            height="440"
            format="webp"
            fit="cover"
            class="h-[280px] w-full object-cover sm:h-[340px] md:h-[440px]"
            loading="lazy"
          />
        </div>

        <!-- Texto -->
        <div class="max-w-[620px] text-white">
          <h2 class="text-[40px] font-semibold leading-[1.15] tracking-tight md:text-[44px]">
            Pide tu presupuesto
          </h2>

          <p class="mt-6 text-[18px] leading-7 text-white/90">
            Lorem ipsum dolor sit amet consectetur. Et adipiscing ac nunc
            consectetur integer eu lorem. In euismod urna tempor nunc
            augue sed. Dictum bibendum tincidunt et curabitur egestas.
          </p>

          <Button
            as-child
            class="mt-8 h-[52px] w-fit rounded-[10px] bg-[#DEF4FF] px-7 text-[18px] font-medium text-[#004F78] hover:bg-white"
          >
            <NuxtLink to="/pedir-presupuesto">Pide tu presupuesto</NuxtLink>
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>
