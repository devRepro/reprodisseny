export function usePriceRequests() {
  const isLoading = ref(false);
  const success = ref(false);
  const error = ref<string | null>(null);
  const notify = useNotify();

  const sendPriceRequest = async (
    payload: CreatePriceRequestInput,
    options: SendPriceRequestOptions = {}
  ) => {
    const {
      endpoint = "/api/price-requests",
      file = null,
      fileKind = "design",
    } = options;

    isLoading.value = true;
    success.value = false;
    error.value = null;

    const loadingToast = notify.show("Enviando solicitud…");

    try {
      const formData = new FormData();
      formData.append("payload", JSON.stringify(payload));

      if (file) {
        formData.append("file", file, file.name);
        formData.append("fileKind", fileKind);
      }

      const res = await $fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      success.value = true;
      return res;
    } catch (e: any) {
      error.value = e?.data?.statusMessage || e?.message || "Error al enviar";
      throw e;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    sendPriceRequest,
    isLoading,
    error,
    success,
  };
}