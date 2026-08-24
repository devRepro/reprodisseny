// composables/usePriceRequests.ts
import { ref } from "vue";
import {
  priceRequestPayloadSchema,
  type CreatePriceRequestInput,
} from "~/shared/schemas/priceRequest";
import {
  isConfirmedPriceRequestResponse,
  type PriceRequestResponse,
} from "~/utils/priceRequestResponse";

type FileKind = "design" | "brief" | "proof" | "final" | "other";

type SendPriceRequestOptions = {
  endpoint?: string;
  file?: File | null;
  fileKind?: FileKind;
};

export class PriceRequestClientValidationError extends Error {
  readonly invalidFields: string[];

  constructor(invalidFields: string[]) {
    super("Revisa los campos de la solicitud antes de enviarla.");
    this.name = "PriceRequestClientValidationError";
    this.invalidFields = invalidFields;
  }
}

export function getPriceRequestClientValidationFields(error: unknown) {
  return error instanceof PriceRequestClientValidationError
    ? error.invalidFields
    : null;
}

export function usePriceRequests() {
  const isLoading = ref(false);
  const success = ref(false);
  const error = ref<string | null>(null);
  const notify = useNotify();
  let requestInFlight = false;

  const sendPriceRequest = async (
    payload: CreatePriceRequestInput,
    options: SendPriceRequestOptions = {},
  ): Promise<PriceRequestResponse | null> => {
    if (requestInFlight) return null;

    const parsedPayload = priceRequestPayloadSchema.safeParse(payload);
    if (!parsedPayload.success) {
      const invalidFields = [
        ...new Set(
          parsedPayload.error.issues.map((issue) =>
            String(issue.path[0] || "form"),
          ),
        ),
      ];
      const validationError = new PriceRequestClientValidationError(invalidFields);
      error.value = validationError.message;
      throw validationError;
    }

    requestInFlight = true;
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

      formData.append("payload", JSON.stringify(parsedPayload.data));

      if (file) {
        formData.append("file", file, file.name);
        formData.append("fileKind", fileKind);
      }

      const res: unknown = await $fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!isConfirmedPriceRequestResponse(res)) {
        throw new Error(
          "El servidor no ha confirmado la creación de la solicitud.",
        );
      }

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
      requestInFlight = false;
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
