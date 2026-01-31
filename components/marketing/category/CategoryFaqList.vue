<script setup lang="ts">
    defineProps<{
      title?: string
      items: { q: string; a: string }[]
    }>()
    </script>
    
    <template>
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 class="text-3xl font-bold tracking-tight">
          {{ title ?? "Preguntas frecuentes" }}
        </h2>
    
        <div class="mt-8 divide-y divide-border border-t border-border">
          <details v-for="it in items" :key="it.q" class="group py-5">
            <summary class="list-none cursor-pointer flex items-center justify-between gap-6">
              <span class="text-sm md:text-base font-medium">
                {{ it.q }}
              </span>
              <span class="text-muted-foreground transition group-open:rotate-180">⌄</span>
            </summary>
    
            <p class="mt-3 text-sm md:text-base text-muted-foreground max-w-3xl">
              {{ it.a }}
            </p>
          </details>
        </div>
      </section>
    </template>
    