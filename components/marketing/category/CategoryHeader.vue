<script setup lang="ts">
    defineProps<{
      title: string
      description?: string
      tags: string[]
    }>()
    </script>
    
    <template>
      <div class="rounded-2xl bg-white shadow-sm border border-black/5 p-6 md:p-8">
        <div class="flex flex-col gap-4">
          <div>
            <h2 class="text-2xl md:text-3xl font-semibold tracking-tight">
              {{ title }}
            </h2>
            <p v-if="description" class="mt-3 text-sm md:text-base text-black/70 leading-relaxed max-w-[900px]">
              {{ description }}
            </p>
          </div>
    
          <div v-if="tags?.length" class="flex flex-wrap gap-2">
            <span
              v-for="t in tags"
              :key="t"
              class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-black/5 text-black/80"
            >
              {{ t }}
            </span>
          </div>
        </div>
      </div>
    </template>
    