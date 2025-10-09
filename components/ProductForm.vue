<script setup lang="ts">
const props = defineProps<{ product: any }>();
const form = reactive({ nombre: "", email: "", cantidad: 1, mensaje: "" });
const sending = ref(false);
const ok = ref(false);
const fail = ref<string | null>(null);

const submit = async () => {
  sending.value = true;
  ok.value = false;
  fail.value = null;
  try {
    await $fetch("/api/price-requests", {
      method: "POST",
      body: { productId: props.product.id, productTitle: props.product.title, ...form },
    });
    ok.value = true;
  } catch (e: any) {
    fail.value = e?.data?.message || e?.message || "Error";
  } finally {
    sending.value = false;
  }
};
</script>

<template>
  <form @submit.prevent="submit" class="space-y-3">
    <div><label>Nombre</label><input v-model="form.nombre" class="input" required /></div>
    <div>
      <label>Email</label
      ><input v-model="form.email" type="email" class="input" required />
    </div>
    <div>
      <label>Cantidad</label
      ><input v-model.number="form.cantidad" type="number" min="1" class="input" />
    </div>
    <div>
      <label>Mensaje</label><textarea v-model="form.mensaje" class="textarea" rows="4" />
    </div>
    <button class="btn" :disabled="sending">
      {{ sending ? "Enviando…" : "Pedir presupuesto" }}
    </button>
    <p v-if="ok" class="text-green-600">¡Gracias! Te contactaremos en breve.</p>
    <p v-if="fail" class="text-red-600">Error: {{ fail }}</p>
  </form>
</template>
