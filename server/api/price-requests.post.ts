import { defineEventHandler } from "h3";

import { createPriceRequest } from "~/server/services/priceRequests/priceRequestService.server";
import { createPriceRequestApiHandler } from "~/server/services/priceRequests/priceRequestApiHandler.server";
import { normalizeServerLeadTracking } from "~/server/services/priceRequests/leadTrackingNormalization";
import { getClientIp, ipHash, rateLimit } from "~/server/utils/rateLimit.server";

export default defineEventHandler(
  createPriceRequestApiHandler({
    createPriceRequest,
    getClientIp,
    ipHash,
    normalizeTracking: normalizeServerLeadTracking,
    rateLimit,
  }),
);
