<template>
  <section class="bg-sky-100">
    <div class="mx-auto max-w-7xl px-6 py-14">
      <div class="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-start">
        <!-- Copy -->
        <div>
          <h1 class="text-5xl leading-tight font-extrabold text-slate-900">
            Hacemos posible la comunicación gráfica
          </h1>

          <p class="mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
            Convertimos tus necesidades en materiales de comunicación corporativa, comercial y marketing.
            Producimos tus proyectos profesionalmente, acompañándote, con calidad y rapidez.
          </p>

          <div class="mt-8">
            <NuxtLink
              to="/contacto"
              class="inline-flex h-11 items-center rounded-lg bg-sky-700 px-6 text-base font-medium text-white hover:bg-sky-800"
            >
              Contacta con un experto
            </NuxtLink>
          </div>
        </div>

        <!-- Badge -->
        <div class="flex lg:justify-end">
          <div class="relative">
            <div class="h-44 w-44 rounded-full bg-white shadow-lg ring-1 ring-black/5 flex items-center justify-center overflow-hidden">
              <!-- Cambia la ruta por tu sello real -->
              <img src="/img/logo/reprodisseny_1983.svg" alt="reprodisseny" class="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      <div class="mt-12">
        <slot />
      </div>
    </div>
  </section>
</template>
