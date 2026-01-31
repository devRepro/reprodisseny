<script setup lang="ts">
    type ActionItem = {
      title: string
      to: string
      imageSrc: string
    }
    
    defineProps<{
      title?: string
      items: ActionItem[]
    }>()
    </script>
    
    <template>
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 class="text-3xl font-bold tracking-tight">
          {{ title ?? "¿Qué quieres hacer?" }}
        </h2>
    
        <!-- Ajusta gaps/cols según Figma -->
        <div class="mt-10 grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-14">
          <NuxtLink
            v-for="it in items"
            :key="it.to"
            :to="it.to"
            class="group flex flex-col items-center text-center"
          >
            <div class="w-[170px] h-[170px] rounded-full overflow-hidden bg-muted">
              <NuxtImg
                :src="it.imageSrc"
                :alt="it.title"
                width="340"
                height="340"
                format="webp"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
    
            <div class="mt-6 text-sm font-medium text-foreground leading-snug max-w-[190px]">
              {{ it.title }}
            </div>
          </NuxtLink>
        </div>
      </section>
    </template>
    