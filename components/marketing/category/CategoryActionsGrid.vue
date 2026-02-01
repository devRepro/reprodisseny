<script setup lang="ts">
    import CategoryActionCard from "./CategoryActionCard.vue"
    
    defineProps<{ items: any[] }>()
    </script>
    
    <template>
      <section class="mx-auto max-w-7xl px-6 py-20">
        <h2 class="mb-10 text-2xl font-semibold">
          ¿Qué quieres hacer?
        </h2>
    
        <div class="grid grid-cols-2 gap-8 md:grid-cols-4">
          <CategoryActionCard
            v-for="item in items"
            :key="item.title"
            :item="item"
          />
        </div>
      </section>
    </template>
    