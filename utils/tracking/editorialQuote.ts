import type { EditorialPublication } from '../../shared/seo/editorialRoutes';
import { normalizeTrackingParams } from './leadAttribution';

// Keep campaign parameters on the link for reloads/new tabs, including without storage consent.
// Reuse the tracking allowlist: unrelated query data must never reach the quote URL.
export function buildEditorialQuotePath(
  publication: EditorialPublication,
  query?: Record<string, unknown>,
) {
  const params = new URLSearchParams({
    publicacion: publication,
    ...normalizeTrackingParams(query),
  });
  return `/pedir-presupuesto?${params}`;
}
