const GENERIC_MESSAGE =
  "No hemos podido enviar la solicitud. Inténtalo de nuevo o llámanos al +34 932 749 890.";
const INVALID_MESSAGE =
  "Revisa los campos de la solicitud antes de enviarla.";
const RATE_LIMIT_MESSAGE =
  "Has realizado demasiados intentos. Espera unos minutos y vuelve a intentarlo.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readStatusCode(error: unknown) {
  if (!isRecord(error)) return null;
  const data = isRecord(error.data) ? error.data : {};
  const candidate = error.statusCode ?? error.status ?? data.statusCode;
  const statusCode = Number(candidate);
  return Number.isInteger(statusCode) ? statusCode : null;
}

function readSafeErrorData(error: unknown) {
  if (!isRecord(error)) return {};
  const response = isRecord(error.data) ? error.data : {};
  return isRecord(response.data) ? response.data : response;
}

function readRequestId(error: unknown) {
  const data = readSafeErrorData(error);
  if (typeof data.requestId !== "string") return null;

  const requestId = data.requestId.trim();
  return /^[A-Za-z0-9_-]{8,80}$/.test(requestId) ? requestId : null;
}

export function getPriceRequestErrorMessage(error: unknown) {
  const statusCode = readStatusCode(error);

  if (statusCode === 400 || statusCode === 422) return INVALID_MESSAGE;
  if (statusCode === 429) return RATE_LIMIT_MESSAGE;

  const requestId = readRequestId(error);
  return requestId ? `${GENERIC_MESSAGE} Referencia: ${requestId}.` : GENERIC_MESSAGE;
}
