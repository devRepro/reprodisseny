<script setup lang="ts">
import { shallowRef, onMounted, computed, ref } from "vue";

const props = defineProps<{
  product: any;
  category?: any;
}>();

const FALLBACK = "/img/placeholders/producto.webp";

const imgSrc = computed(() => {
  const x = props.product?.image;
  const src = typeof x === "string" ? x : x?.src;
  return src || FALLBACK;
});

const imgAlt = computed(() => {
  const x = props.product?.image;
  return (typeof x === "object" ? x?.alt : undefined) || props.product?.title || "Producto";
});

const extraFields = computed(() => props.product?.formFields || props.product?.extraFields || []);
const categorySlug = computed(() => props.category?.slug || props.product?.categorySlug || "");
const productTitle = computed(() => props.product?.title || "");

const LeadFormCmp = shallowRef<any>(null);
const leadFormLoadError = ref<unknown>(null);

onMounted(async () => {
  try {
    LeadFormCmp.value = (await import("@/components/marketing/product/LeadForm.vue")).default;
  } catch (e) {
    leadFormLoadError.value = e;
    console.error("LeadForm import failed:", e);
  }
});
</script>

<template>
  <section class="w-[1200px]">
    <div class="grid grid-cols-[575px_555.95px] gap-[69px] items-start">
      <!-- IZQUIERDA -->
      <div class="w-[575px]">
        <div class="w-[571.14px] min-h-[104px] flex flex-col gap-6">
          <h1 class="text-[30px] leading-[36px] font-semibold text-[#1E1E1E]">
            {{ product?.title }}
          </h1>
        </div>

        <div class="mt-6">
          <NuxtImg
            :src="imgSrc"
            :alt="imgAlt"
            class="w-[575px] h-[575px] rounded-[12px] object-cover"
            sizes="575px"
            densities="x1 x2"
            fetchpriority="high"
          />
        </div>
      </div>

      <!-- DERECHA -->
      <div class="pt-[60px] w-[555.95px]">
        <ClientOnly>
          <div v-if="leadFormLoadError" class="text-sm text-red-600">
            Error cargando el formulario.
          </div>

          <component
            v-else
            :is="LeadFormCmp"
            v-if="LeadFormCmp"
            :producto="productTitle"
            :product-data="product"
            :extra-fields="extraFields"
            :category-slug="categorySlug"
          />

          <template #fallback>
            <div class="text-sm text-[#959595]">Carregant formulari…</div>
          </template>
        </ClientOnly>
      </div>
    </div>
  </section>
</template>
