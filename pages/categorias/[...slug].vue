// pages/categorias/[...slug].vue (o el nombre que tenga tu archivo de página dinámica)
<script setup lang="ts">
// --- Imports ---
import { computed, watchEffect } from '#imports';
import { setPageLayout } from '#imports'; // Para cambiar el layout dinámicamente
import { useCategoriaData } from '@/composables/useCategoriaData'; // Tu composable de datos
import { useSeoContent } from '~/composables/useSeoContent';       // Tu composable de SEO
import CategoryVistaCategoria from '@/components/category/vista/Categoria.vue';
import CategoryVistaProducto from '@/components/category/vista/Producto.vue';
import CategoryVistaSubcategoria from '@/components/category/vista/Subcategoria.vue';
import SharedLoader from '@/components/shared/Loader.vue'; // Asumiendo que tienes un Loader

// --- Fetch Page-Specific Data ---
const { contentData, pending, error } = useCategoriaData();

// --- Determine Component to Render ---
const contentType = computed(() => contentData.value?.type || null);

const componentMap = {
  categoria: CategoryVistaCategoria,
  producto: CategoryVistaProducto,
  subcategoria: CategoryVistaSubcategoria,
} as const;

const resolvedComponent = computed(() => {
  const type = contentType.value;
  return type ? componentMap[type as keyof typeof componentMap] : null;
});

// --- Dynamically Set Page Layout ---
watchEffect(() => {
  // Determine the layout based on the fetched content type or state
  const type = contentData.value?.type;

  if (type === 'producto') {
    setPageLayout('productos');
    // console.log("Debug: Layout set to 'productos'");
  } else if (type === 'categoria' || type === 'subcategoria') {
    setPageLayout('categorias');
    // console.log("Debug: Layout set to 'categorias'");
  } else {
    // Applies during loading, on error, or if type is unknown/null
    setPageLayout('default');
    // console.log("Debug: Layout set to 'default'");
  }
});

// --- Apply SEO using the composable ---
watchEffect(() => {
  // Only apply SEO if data is loaded successfully
  if (contentData.value && !error.value) {
    useSeoContent(contentData.value);
    // console.log("Debug: SEO applied via useSeoContent");
  }
  // Optional: Handle SEO for error state if needed, maybe set a generic error title/desc
  // else if (error.value) {
  //   useServerSeoMeta({ title: 'Error', description: 'Página no encontrada' });
  // }
});

// --- No manual definePageMeta or useHead for SEO needed here ---

</script>

<template>
<<<<<<< HEAD
  <div>
    <!-- Loading State -->
    <SharedLoader v-if="pending" />

    <!-- Content Rendering (Dynamic Component) -->
    <component
      v-else-if="resolvedComponent && contentData"
      :is="resolvedComponent"
      :data="contentData"
    />

    <!-- Error State -->
    <section v-else-if="error" class="text-red-500 text-center py-10 px-4">
      <h2>Error al cargar el contenido</h2>
      <p class="text-sm mt-2">{{ error?.message || 'Ha ocurrido un error inesperado.' }}</p>
      <!-- Consider adding a link back home or to retry -->
      <NuxtLink to="/" class="mt-4 inline-block text-primary hover:underline">Volver al inicio</NuxtLink>
    </section>

    <!-- Unknown/Unsupported Content Type State -->
    <section v-else-if="!pending" class="text-center py-10 px-4 text-muted-foreground">
      <!-- Checks !pending to avoid flashing this during initial load -->
      <h2>Contenido no encontrado o no soportado</h2>
      <p class="text-sm mt-2">El tipo de contenido solicitado no se pudo mostrar.</p>
       <NuxtLink to="/" class="mt-4 inline-block text-primary hover:underline">Volver al inicio</NuxtLink>
    </section>
=======
  <div class="category-product-page">
    <!-- Loader -->
    <div v-if="pending" class="text-center py-10">
      <p>Cargando…</p>
    </div>

    <!-- Contenido -->
    <div v-else-if="contentData">

      <!-- Vista de Categoría -->
      <section v-if="contentType === 'categoria'">
        <!-- Header personalizado -->
        <CategoryHeader
          :image="resolveImageUrl((contentData as Categoria).image, contentData.type)"
          :alt="(contentData as Categoria).alt || (contentData as Categoria).title"
          :title="(contentData as Categoria).title"
          :description="(contentData as Categoria).description"
          cta-text="Ver productos"
          :cta-link="`#productos`"
        />

        <!-- Listado de productos -->
        <section v-if="categorySlug" id="productos">
          <h2 class="text-2xl font-semibold mb-4 border-b pb-2">
            Productos en {{ (contentData as Categoria).nav || (contentData as Categoria).title }}
          </h2>

          <div v-if="pendingProducts" class="text-center py-6">Cargando productos…</div>
          <div
            v-else-if="associatedProducts && associatedProducts.length"
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <div
              v-for="product in associatedProducts"
              :key="product.id || product.slug"
              class="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col cursor-pointer"
              @click="goToProduct(product)"
            >
              <NuxtImg
                v-if="product.image"
                :src="resolveImageUrl(product.image, product.type)"
                :alt="product.alt || product.title"
                class="w-full h-48 object-cover"
                loading="lazy"
                format="webp"
                quality="80"
              />
              <div v-else class="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                Sin imagen
              </div>

              <div class="p-4 flex flex-col flex-grow">
                <h3 class="font-semibold text-lg mb-1">{{ product.nav || product.title }}</h3>
                <p class="text-sm text-gray-500 mb-2 line-clamp-3 flex-grow">
                  {{ product.description }}
                </p>
                <NuxtLink
                  to="/contacto"
                  class="mt-auto text-right font-medium underline text-primary"
                >
                  Solicitar precio
                </NuxtLink>
              </div>
            </div>
          </div>

          <p v-else class="text-gray-500 italic">
            No hay productos listados en esta categoría.
          </p>
        </section>
      </section>

      <!-- Vista de Producto -->
      <section v-else-if="contentType === 'producto'">
        <!-- Header de producto -->
        <ProductHeader :image="resolveImageUrl((contentData as Producto).image, contentData.type)"
          :alt="(contentData as Producto).alt || (contentData as Producto).title"
          :title="(contentData as Producto).title"
          :formFields="(contentData as Producto).formFields"
        />

        <!-- Descripción opcional debajo del formulario -->
        <p v-if="(contentData as Producto).description" class="mt-6 text-lg text-gray-600">
          {{ (contentData as Producto).description }}
        </p>
      </section>

      <!-- Vista de Subcategoría -->
      <section v-else-if="contentType === 'subcategoria'">
        <!-- similar a categoría -->
      </section>

      <!-- Tipo desconocido -->
      <div v-else class="text-center text-orange-500 py-10">
        Tipo de contenido '{{ contentData.type }}' no reconocido.
      </div>
    </div>

    <!-- Error genérico -->
    <div v-else-if="error && !pending" class="text-center py-10 text-red-500">
      <p>Error cargando datos. Inténtalo de nuevo más tarde.</p>
      <p class="mt-2 text-sm">{{ error.message }}</p>
    </div>
>>>>>>> formfields
  </div>
</template>