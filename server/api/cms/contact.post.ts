import { defineEventHandler } from "h3";
import { createContactApiHandler } from "~/server/services/priceRequests/contactApiHandler.server";
import { createPriceRequest } from "~/server/services/priceRequests/priceRequestService.server";
import { rateLimit, ipHash, getClientIp } from "~/server/utils/rateLimit.server";
import { normalizeServerLeadTracking } from "~/server/services/priceRequests/leadTrackingNormalization";

export default defineEventHandler(createContactApiHandler({
  createPriceRequest,
  rateLimit,
  ipHash,
  getClientIp,
  normalizeTracking: normalizeServerLeadTracking,
}));
