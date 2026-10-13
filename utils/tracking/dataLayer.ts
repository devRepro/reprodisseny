export const DATA_LAYER_EVENT_TIMEOUT_MS = 1500;

export type DataLayerEvent = Record<string, unknown>;

export type DataLayerTarget = {
  dataLayer?: DataLayerEvent[];
  setTimeout(callback: () => void, timeout: number): number;
  clearTimeout(timeoutId: number): void;
};

export type DataLayerDeliveryResult = "processed" | "timeout";

export function pushDataLayerEventAndWait(
  target: DataLayerTarget,
  event: DataLayerEvent,
  timeout = DATA_LAYER_EVENT_TIMEOUT_MS,
): Promise<DataLayerDeliveryResult> {
  return new Promise((resolve) => {
    let settled = false;
    let timeoutId = 0;

    const finish = (result: DataLayerDeliveryResult) => {
      if (settled) return;

      settled = true;
      if (timeoutId) target.clearTimeout(timeoutId);
      resolve(result);
    };

    timeoutId = target.setTimeout(() => finish("timeout"), timeout);
    target.dataLayer = target.dataLayer || [];

    try {
      target.dataLayer.push({
        ...event,
        eventCallback: () => finish("processed"),
        eventTimeout: timeout,
      });
    } catch {
      finish("timeout");
    }
  });
}
