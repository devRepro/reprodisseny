<script setup lang="ts">
import type { Producto } from "@/types";
import { resolveImageUrl } from "@/utils/images";

const { data } = defineProps<{ data: Producto }>();

const imageUrl = resolveImageUrl(data.image, data.type);
const altText = data.alt || data.title;
</script>

<template>
  <section>
    <SharedHeaderSection :title="data.title" :alt="altText" :image="imageUrl">
      <template #right>
        <ClientOnly>
          <SharedFormsLeadForms
            :producto="data.title"
            :extra-fields="data.formFields"
            :product-data="product"
          />
        </ClientOnly>
      </template>
    </SharedHeaderSection>
  </section>
</template>
