// composables/usePriceRequests.ts
import { ref } from "vue";

type FileKind = "design" | "brief" | "proof" | "final" | "other";

type SendPriceRequestOptions = {
  endpoint?: string;
  file?: File | null;
  fileKind?: FileKind;
};

export function usePriceRequests() {
  const isLoading = ref(false);
  const success = ref(false);
  const error = ref<string | null>(null);
  const notify = useNotify();

  const sendPriceRequest = async (
    payload: CreatePriceRequestInput,
    options: SendPriceRequestOptions = {},
  ) => {
    const {
      endpoint = "/api/price-requests",
      file = null,
      fileKind = "design",
    } = options;

    isLoading.value = true;
    success.value = false;
    error.value = null;

    notify.show("Enviando solicitud…");

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
      error.value =
        e?.data?.statusMessage ||
        e?.statusMessage ||
        e?.data?.message ||
        e?.message ||
        "No se ha podido enviar la solicitud. Inténtalo de nuevo.";

      throw e;
    } finally {
      isLoading.value = false;
    }
  };

  const createPriceRequest = async (
    payload: CreatePriceRequestInput,
    endpointOrOptions: string | SendPriceRequestOptions = "/api/price-requests",
    file: File | null = null,
    fileKind: FileKind = "design",
  ) => {
    const options: SendPriceRequestOptions =
      typeof endpointOrOptions === "string"
        ? {
            endpoint: endpointOrOptions,
            file,
            fileKind,
          }
        : endpointOrOptions;

    return sendPriceRequest(payload, options);
  };

  return {
    sendPriceRequest,
    createPriceRequest,
    isLoading,
    error,
    success,
  };
}