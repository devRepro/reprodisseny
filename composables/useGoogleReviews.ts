// composables/useGoogleReviews.ts
export const useGoogleReviews = () => {
  return useAsyncData('google-reviews', async () => {
    const { data } = await useFetch('/api/google-reviews')
    return data.value?.reviews || []
  })
}
