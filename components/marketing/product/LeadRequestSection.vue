<script setup lang="ts">
  import { ref } from "vue";
  import LeadForm from "@/components/marketing/product/LeadForm.vue";
  import LeadSuccess from "@/components/marketing/product/LeadSuccess.vue";
  
  const props = defineProps<{
    producto: string;
    categorySlug: string;
    extraFields?: any[];
    productData?: any;
  }>();
  
  const submitted = ref(false);
  
  function handleSuccess() {
    submitted.value = true;
  }
  
  function handleReset() {
    submitted.value = false;
  }
  </script>
  
  <template>
    <div class="w-full">
      <LeadSuccess
        v-if="submitted"
        :product-name="props.producto"
        @reset="handleReset"
      />
  
      <LeadForm
        v-else
        :producto="props.producto"
        :category-slug="props.categorySlug"
        :extra-fields="props.extraFields || []"
        :product-data="props.productData"
        @success="handleSuccess"
      />
    </div>
  </template>