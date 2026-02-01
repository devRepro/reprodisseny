<script setup lang="ts">
    defineProps<{ items: any[] }>()
    </script>
    
    <template>
      <section class="mx-auto max-w-7xl px-6 pb-32">
        <h2 class="mb-10 text-center text-2xl font-semibold">
          Te puedes inspirar con nuestros últimos trabajos
        </h2>
    
        <div class="grid grid-cols-2 gap-6 md:grid-cols-4">
          <img
            v-for="img in items"
            :key="img"
            :src="img"
            class="aspect-square rounded-xl object-cover"
          />
        </div>
      </section>
    </template>
    