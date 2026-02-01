<script setup lang="ts">
    defineProps<{ category: any }>()
    </script>
    
    <template>
      <section class="mx-auto max-w-4xl px-6 py-16 text-center">
        <h2 class="text-3xl font-semibold leading-tight">
          {{ category?.introTitle }}
        </h2>
      </section>
    </template>
    