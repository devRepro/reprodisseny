<script setup lang="ts">
  import { computed } from "vue"
  import { Button } from "@/components/ui/button"
  
  type ImageDto = { src: string; alt?: string } | null
  
  const props = withDefaults(defineProps<{
    title: string
    href: string
    image?: ImageDto
    ctaText?: string
  }>(), {
    image: null,
    ctaText: "Ver categoría",
  })
  
  const src = computed(() => String(props.image?.src || "").trim())
  const isRemote = computed(() => /^https?:\/\//i.test(src.value))
  </script>
  
  <template>
    <article class="flex flex-col items-center text-center">
      <NuxtLink :to="href" class="block w-full">
        <div class="w-full overflow-hidden rounded-2xl bg-brand-bg-2 shadow-sm">
          <div class="relative h-[260px] w-full">
            <!-- ✅ Azure / remoto -->
            <img
              v-if="isRemote"
              :src="src"
              :alt="props.image?.alt || title"
              class="absolute inset-0 h-full w-full object-contain p-6"
              loading="lazy"
              decoding="async"
              width="252"
              height="260"
            />
  
            <!-- ✅ Local -->
            <NuxtImg
              v-else-if="src"
              :src="src"
              :alt="props.image?.alt || title"
              class="absolute inset-0 h-full w-full object-contain p-6"
              loading="lazy"
              :width="252"
              :height="260"
            />
          </div>
        </div>
      </NuxtLink>
  
      <NuxtLink :to="href" class="mt-6 block">
        <h3 class="text-body font-medium text-brand-ink-medium">{{ title }}</h3>
      </NuxtLink>
  
      <Button as-child class="mt-4 h-10 rounded-full px-6">
        <NuxtLink :to="href">{{ ctaText }}</NuxtLink>
      </Button>
    </article>
  </template>