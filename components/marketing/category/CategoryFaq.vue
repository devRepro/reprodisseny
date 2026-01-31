<script setup lang="ts">
    defineProps<{ items: { q: string; a: string }[] }>()
    </script>
    
    <template>
      <section class="rounded-2xl border border-black/10 bg-white p-6 md:p-8">
        <h2 class="text-xl md:text-2xl font-semibold tracking-tight">Preguntes freqüents</h2>
    
        <div class="mt-6 divide-y divide-black/10">
          <details v-for="it in items" :key="it.q" class="py-4 group">
            <summary class="cursor-pointer list-none flex items-center justify-between gap-4">
              <span class="font-medium text-black/90">{{ it.q }}</span>
              <span class="text-black/40 group-open:rotate-45 transition">+</span>
            </summary>
            <p class="mt-3 text-sm md:text-base text-black/65 leading-relaxed max-w-[900px]">
              {{ it.a }}
            </p>
          </details>
        </div>
      </section>
    </template>
    