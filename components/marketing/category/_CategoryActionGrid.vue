<script setup lang="ts">
  defineProps<{ item: any }>()
  </script>
  
  <template>
    <div class="text-center">
      <div class="mx-auto h-40 w-40 overflow-hidden rounded-full">
        <img
          :src="item.image"
          class="h-full w-full object-cover"
          alt=""
        />
      </div>
      <p class="mt-4 text-sm font-medium">
        {{ item.title }}
      </p>
    </div>
  </template>
  