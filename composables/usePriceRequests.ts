import { ref } from "vue";
import { useNotify } from "@/composables/useNotify";

export type CreatePriceRequestInput = Record<string, any>;

export type SendPriceRequestOptions = {
  endpoint?: string;
  file?: File | null;
  fileKind?: "design" | "brief" | "proof" | "final" | "other";
};

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

    try {
      const formData = new FormData();
      formData.append("payload", JSON.stringify(payload));

      if (file) {
        formData.append("file", file, file.name);
        formData.append("fileKind", fileKind);
      }
      console.log("[PRICE REQUEST][CLIENT] payload", payload)
console.log("[PRICE REQUEST][CLIENT] file", file ? {
  name: file.name,
  size: file.size,
  type: file.type,
} : null)

      const request = $fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const res = await notify.promise(request, {
        loading: "Enviando solicitud…",
        success: (r: any) => r?.message || "Solicitud enviada",
        error: (e: any) => e?.data?.statusMessage || e?.message || "Error al enviar",
      });

      success.value = true;
      return res;
    } catch (e: any) {
      error.value = e?.data?.statusMessage || e?.message || "Error";
      notify.error("No se pudo enviar", error.value);
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