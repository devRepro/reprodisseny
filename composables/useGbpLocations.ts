// /composables/useGbpLocations.ts
export function useGbpLocations() {
  return useFetch('/api/gbp/locations', { server: true, lazy: false })
}
