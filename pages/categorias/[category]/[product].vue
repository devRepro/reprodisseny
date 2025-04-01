<template>
  <div>
    <div v-if="productData">
      <h1 class="text-3xl font-bold mb-4">{{ productData.title }}</h1>
      <p class="mb-4 text-gray-600">{{ productData.description }}</p>

      <div v-if="productData.image" class="mb-6">
        <NuxtImg
          :src="`/img/productos/${productData.image}`"
          :alt="productData.alt"
          class="rounded-xl shadow-md w-full max-w-3xl mx-auto"
        />
      </div>

      <ContentRenderer :value="productData" />
    </div>

    <div v-else>
      <p class="text-red-500">Producto no encontrado.</p>
    </div>
  </div>
</template>
