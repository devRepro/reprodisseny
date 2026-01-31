<script setup lang="ts">
    type Crumb = { label: string; to: string }
    type Cta = { label: string; to: string }
    
    defineProps<{
      title: string
      subtitle?: string
      imageSrc?: string
      breadcrumbs?: Crumb[]
      primaryCta?: Cta
      secondaryCta?: Cta
    }>()
    </script>
    
    <template>
      <section class="relative overflow-hidden">
        <!-- Background image -->
        <div class="absolute inset-0">
          <img
            v-if="imageSrc"
            :src="imageSrc"
            alt=""
            class="h-full w-full object-cover"
            loading="eager"
          />
          <div class="absolute inset-0 bg-black/45"></div>
          <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70"></div>
        </div>
    
        <div class="relative mx-auto w-full max-w-[1200px] px-4 pt-10 pb-16">
          <!-- Breadcrumbs -->
          <nav v-if="breadcrumbs?.length" class="text-white/80 text-sm">
            <ol class="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li v-for="(c, i) in breadcrumbs" :key="c.to" class="flex items-center gap-2">
                <NuxtLink :to="c.to" class="hover:text-white transition">
                  {{ c.label }}
                </NuxtLink>
                <span v-if="i !== breadcrumbs.length - 1" class="text-white/50">/</span>
              </li>
            </ol>
          </nav>
    
          <div class="mt-8 max-w-[760px]">
            <h1 class="text-white font-semibold tracking-tight text-4xl md:text-5xl leading-[1.05]">
              {{ title }}
            </h1>
            <p v-if="subtitle" class="mt-4 text-white/85 text-base md:text-lg leading-relaxed">
              {{ subtitle }}
            </p>
    
            <div class="mt-8 flex flex-col sm:flex-row gap-3">
              <NuxtLink
                v-if="primaryCta"
                :to="primaryCta.to"
                class="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium bg-white text-black hover:bg-white/90 transition"
              >
                {{ primaryCta.label }}
              </NuxtLink>
    
              <NuxtLink
                v-if="secondaryCta"
                :to="secondaryCta.to"
                class="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium border border-white/30 text-white hover:bg-white/10 transition"
              >
                {{ secondaryCta.label }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>
    </template>
    