import { isConfirmedPriceRequestResponse, type PriceRequestResponse } from "./priceRequestResponse";

// Keep the contact API's nested item contract; adapt only after validation.
export function getConfirmedContactResponse(value: unknown): PriceRequestResponse | null {
  if (!value || typeof value !== "object") return null;
  const result = value as Record<string, unknown>;
  if (!result.item || typeof result.item !== "object") return null;
  const item = result.item as Record<string, unknown>;
  const response = {
    ok: result.ok,
    duplicated: result.duplicated,
    itemId: item.id,
    requestKey: item.requestKey,
  };
  return isConfirmedPriceRequestResponse(response) ? response : null;
}
