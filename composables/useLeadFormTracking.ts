import type { TrackingContext } from "~/types/tracking";
import { createLeadFormTracker } from "~/utils/tracking/leadForm";

type ContextProvider = () => Partial<TrackingContext>;

export function useLeadFormTracking(getContext: ContextProvider) {
  const tracking = useTracking();
  const tracker = createLeadFormTracker((event, payload) => {
    tracking.pushPrivacySafeEvent(event, payload, getContext());
  });

  function onFormInteraction(event: Event) {
    const eventTarget = event.target;
    if (!(eventTarget instanceof HTMLElement)) return;

    const target = eventTarget.closest<HTMLElement>(
      "[name], [data-field-name], button[type='submit']",
    );
    if (!target) return;

    const fieldName =
      target.getAttribute("name") ||
      target.getAttribute("data-field-name") ||
      (target instanceof HTMLButtonElement && target.type === "submit"
        ? "submit"
        : null);
    const controlType =
      target instanceof HTMLInputElement ? target.type : target.tagName.toLowerCase();

    tracker.trackInteraction({
      trusted: event.isTrusted,
      fieldName,
      controlType,
    });
  }

  return {
    onFormInteraction,
    trackValidationError: tracker.trackValidationError,
    trackConversion: tracker.trackConversion,
    submitAndTrack: tracker.submitAndTrack,
    resetTrackingCycle: tracker.resetCycle,
  };
}
