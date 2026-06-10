// ~/plugins/tracking.client.ts

import { captureAttribution } from "~/utils/tracking/attribution"

export default defineNuxtPlugin(() => {
  captureAttribution()
})