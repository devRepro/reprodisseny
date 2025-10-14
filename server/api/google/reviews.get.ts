// server/api/google/reviews.get.ts
export default defineEventHandler(async (event) => {
  const { googlePlacesApiKey, googlePlaceId } = useRuntimeConfig()
  const q = getQuery(event)
  const language = typeof q.lang === 'string' ? q.lang : 'es'

  const url = 'https://maps.googleapis.com/maps/api/place/details/json'
  const params = {
    place_id: googlePlaceId,
    fields: 'rating,user_ratings_total,reviews', // máx. 5 reseñas
    key: googlePlacesApiKey,
    language
  }

  const res = await $fetch<any>(url, { params })
  const r = res?.result

  return {
    rating: r?.rating ?? null,
    total: r?.user_ratings_total ?? 0,
    reviews: (r?.reviews ?? []).map((it: any) => ({
      author_name: it.author_name,
      author_url: it.author_url, // añade el enlace al perfil cuando exista
      profile_photo_url: it.profile_photo_url,
      rating: it.rating,
      relative_time_description: it.relative_time_description,
      text: it.text
    }))
  }
})
