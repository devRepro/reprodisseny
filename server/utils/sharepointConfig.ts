// server/utils/sharepointConfig.ts
import { useRuntimeConfig } from '#imports'

export function getSharePointConfig() {
  const cfg = useRuntimeConfig()
  // Prioriza ms.*, haz fallback si queda legacy
  const siteId =
    cfg.ms?.siteId ||
    cfg.graph?.siteId ||
    cfg.public?.graphSiteId

  const siteHostname = cfg.ms?.siteHostname
  const sitePath     = cfg.ms?.sitePath

  const priceRequestsListId =
    cfg.ms?.priceRequestsListId ||
    cfg.graph?.priceRequestsListId ||
    cfg.public?.priceRequestsListId

  const commentsListId =
    cfg.ms?.commentsListId ||
    cfg.graph?.commentsListId ||
    cfg.public?.priceRequestsCommentsListId

  const ordersListId =
    cfg.ms?.ordersListId || cfg.graph?.ordersListId

  if (!siteId) {
    throw new Error('Falta GRAPH_SITE_ID en runtimeConfig.ms.siteId')
  }
  if (!priceRequestsListId) {
    throw new Error('Falta PRICE_REQUESTS_LIST_ID en runtimeConfig.ms.priceRequestsListId')
  }

  return {
    siteId,
    siteHostname,
    sitePath,
    priceRequestsListId,
    commentsListId,
    ordersListId,
  }
}
