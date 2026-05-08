// utils/analytics.ts
const response = await sendPriceRequest(
  {
    name: values.nombre.trim(),
    email: values.email.trim(),
    phone: values.telefono?.trim(),
    company: values.empresa?.trim() || null,
    message: values.comentario?.trim() || "Solicitud de presupuesto",
    categorySlug: props.categorySlug,
    product: {
      name: props.producto,
      slug: slug || null,
      sku: props.productData?.sku ?? null,
      url: props.productData?.path || sourceUrl.value,
    },
    extras,
    consent: true,
    sourceUrl: sourceUrl.value,
    utm: utm.value,
    initialStatus: "Nova",
  },
  { file: file.value, fileKind: "design" }
);

if (!error.value) {
  submittedEmail.value = values.email.trim();
  submittedReference.value =
    (response as any)?.reference ||
    (response as any)?.requestId ||
    (response as any)?.id ||
    null;

  success.value = true;
  emit("success");
}