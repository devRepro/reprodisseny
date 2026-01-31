<script setup lang="ts">
    import { computed, ref } from "vue"
    
    type GuideTab = {
      key: string
      label: string
      imageSrc?: string
      bullets: string[]
    }
    
    const props = defineProps<{
      title: string
      subtitle?: string
      tabs: GuideTab[]
      initialKey?: string
    }>()
    
    const activeKey = ref(props.initialKey ?? props.tabs?.[0]?.key ?? "")
    const active = computed(() => props.tabs.find(t => t.key === activeKey.value) ?? props.tabs[0])
    </script>
    
    <template>
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 class="text-3xl font-bold tracking-tight">{{ title }}</h2>
        <p v-if="subtitle" class="mt-2 text-base text-muted-foreground max-w-3xl">
          {{ subtitle }}
        </p>
    
        <!-- Tabs row -->
        <div class="mt-8 flex flex-wrap items-center gap-3">
          <button
            v-for="t in tabs"
            :key="t.key"
            type="button"
            @click="activeKey = t.key"
            class="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition
                   hover:bg-muted/60"
            :class="activeKey === t.key ? 'bg-muted' : 'bg-transparent'"
          >
            {{ t.label }}
            <span class="text-muted-foreground">⌄</span>
          </button>
        </div>
    
        <!-- Panel -->
        <div class="mt-6 rounded-lg border border-border bg-card shadow-sm">
          <div class="grid md:grid-cols-[240px_1fr] gap-6 p-6">
            <div class="rounded-md bg-muted overflow-hidden w-full aspect-[4/5]">
              <NuxtImg
                v-if="active?.imageSrc"
                :src="active.imageSrc"
                alt=""
                width="480"
                height="600"
                format="webp"
                class="w-full h-full object-cover"
                loading="lazy"
              />
              <div v-else class="w-full h-full"></div>
            </div>
    
            <ul class="list-disc pl-5 space-y-4 text-sm md:text-base text-foreground">
              <li v-for="(b, i) in active?.bullets ?? []" :key="i">
                {{ b }}
              </li>
            </ul>
          </div>
        </div>
      </section>
    </template>
    