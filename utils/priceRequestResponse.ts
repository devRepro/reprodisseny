export type PriceRequestResponse = {
  ok: true;
  duplicated: boolean;
  itemId: string | number;
  requestKey: string;
  file?: unknown;
  message?: string;
};

function hasValue(value: unknown): value is string | number {
  return (
    (typeof value === "string" && value.trim().length > 0) ||
    (typeof value === "number" && Number.isFinite(value))
  );
}

export function isConfirmedPriceRequestResponse(
  value: unknown,
): value is PriceRequestResponse {
  if (!value || typeof value !== "object") return false;

  const result = value as Record<string, unknown>;

  return (
    result.ok === true &&
    typeof result.duplicated === "boolean" &&
    hasValue(result.itemId) &&
    typeof result.requestKey === "string" &&
    result.requestKey.trim().length > 0
  );
}

export function isCreatedPriceRequestResponse(
  value: unknown,
): value is PriceRequestResponse & { duplicated: false } {
  return isConfirmedPriceRequestResponse(value) && value.duplicated === false;
}

