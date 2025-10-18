// composables/useGbpLocations.ts
export function useGbpLocations() {
    const token = useCookie('gbp_access_token')
    const just = useCookie('gbp_just_logged') // del callback
    const route = useRoute()
  
    const shouldFetch = computed(() =>
      !!token.value &&
      route.path !== '/api/gbp/oauth/callback' // por si acaso
    )
  
    const { data, pending, error, refresh } = useAsyncData(
      'gbp:locations',
      () => $fetch('/api/gbp/locations'),
      { server: false, lazy: true, dedupe: 'defer', immediate: false }
    )
  
    watchEffect(() => {
      if (shouldFetch.value) {
        refresh()
        if (just.value) just.value = null // consume flag
      }
    })
  
    return { data, pending, error, refresh }
  }
  