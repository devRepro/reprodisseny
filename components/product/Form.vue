<!-- components/product/ProductForm.vue -->
<script setup lang="ts">
import { reactive, computed } from "vue";

type Field = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select";
  required?: boolean;
  options?: string[];
};

const props = defineProps<{
  product: {
    title: string;
    sku?: string;
    price?: number;
    priceCurrency?: string;
    formFields?: Field[];
  };
}>();

const fields = computed<Field[]>(() =>
  Array.isArray(props.product?.formFields) ? props.product.formFields : []
);

const form = reactive<Record<string, string | number>>({});
fields.value.forEach((f) => {
  form[f.name] = "";
});

const submitting = reactive({ value: false });
const errorMsg = reactive({ value: "" });
const okMsg = reactive({ value: "" });

async function submit() {
  errorMsg.value = "";
  okMsg.value = "";
  // validación mínima
  for (const f of fields.value) {
    if (f.required && !form[f.name]) {
      errorMsg.value = `Falta el campo: ${f.label}`;
      return;
    }
  }
  submitting.value = true;
  try {
    await $fetch("/api/quote/product", {
      method: "POST",
      body: {
        product: { title: props.product.title, sku: props.product.sku ?? "" },
        data: form,
      },
    });
    okMsg.value = "¡Recibido! Te contactaremos en breve.";
    Object.keys(form).forEach((k) => (form[k] = ""));
  } catch (e: any) {
    errorMsg.value = e?.data?.message || "No se pudo enviar la solicitud.";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <aside class="rounded-2xl border bg-card p-5 shadow-sm">
    <h2 class="text-xl font-semibold">Solicita presupuesto</h2>
    <p class="text-sm text-muted-foreground">
      Rellena el formulario y te respondemos rápido.
    </p>

    <form class="mt-4 space-y-4" @submit.prevent="submit">
      <div v-for="(f, i) in fields" :key="i" class="space-y-1.5">
        <label :for="f.name" class="text-sm font-medium"
          >{{ f.label }}<span v-if="f.required" aria-hidden="true"> *</span></label
        >

        <input
          v-if="f.type === 'text' || f.type === 'number'"
          :id="f.name"
          :name="f.name"
          :type="f.type"
          v-model="form[f.name]"
          class="w-full rounded-md border px-3 py-2 bg-background"
          :required="f.required"
        />

        <textarea
          v-else-if="f.type === 'textarea'"
          :id="f.name"
          :name="f.name"
          rows="4"
          v-model="form[f.name]"
          class="w-full rounded-md border px-3 py-2 bg-background"
          :required="f.required"
        />

        <select
          v-else-if="f.type === 'select'"
          :id="f.name"
          :name="f.name"
          v-model="form[f.name]"
          class="w-full rounded-md border px-3 py-2 bg-background"
          :required="f.required"
        >
          <option value="" disabled>Selecciona…</option>
          <option v-for="(opt, j) in f.options || []" :key="j" :value="opt">
            {{ opt }}
          </option>
        </select>
      </div>

      <button
        type="submit"
        class="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground disabled:opacity-60"
        :disabled="submitting.value"
      >
        {{ submitting.value ? "Enviando…" : "Solicitar presupuesto" }}
      </button>

      <p v-if="errorMsg.value" class="text-sm text-red-600">{{ errorMsg.value }}</p>
      <p v-if="okMsg.value" class="text-sm text-green-600">{{ okMsg.value }}</p>
    </form>
  </aside>
</template>
