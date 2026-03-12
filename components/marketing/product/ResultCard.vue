<template>
  <article class="catalog-card">
    <NuxtLink :to="`/productos/${product.slug}`" class="block">
      <div class="catalog-card-media">
        <img
          v-if="product.image"
          :src="product.image"
          :alt="product.alt || product.title"
          class="h-full w-full object-cover"
        />
      </div>
    </NuxtLink>

    <div class="catalog-card-body">
      <p v-if="product.categorySlug" class="catalog-kicker">
        {{ product.categorySlug }}
      </p>

      <h3 class="catalog-title mt-2">
        {{ product.title }}
      </h3>

      <p v-if="product.description" class="catalog-copy mt-3">
        {{ product.description }}
      </p>

      <div class="mt-5 flex flex-col gap-2 sm:flex-row">
        <NuxtLink
          :to="product.path"
          class="btn-outline"
        >
          Ver producto
        </NuxtLink>

        <NuxtLink
          :to="`${product.path}#presupuesto`"
          class="btn-primary"
        >
          Solicitar presupuesto
        </NuxtLink>
      </div>
    </div>
  </article>
</template>