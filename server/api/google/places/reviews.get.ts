import { defineEventHandler, getQuery, createError } from 'h3'


type ReviewDTO = {
  rating: number
  text: string
  author: string
  profilePhotoUri?: string | null
  publishTime?: string
  relativeTime?: string
}

type ResponseDTO = {
  rating?: number
  userRatingCount?: number
  reviews: ReviewDTO[]
}

const MOCK: ResponseDTO = {
  rating: 4.8,
  userRatingCount: 127,
  reviews: [
    {
      rating: 5,
      text: 'Trabajo impecable y entrega rapidísima. Nos salvaron una campaña.',
      author: 'Marta R.',
      profilePhotoUri: 'https://i.pravatar.cc/64?img=5',
      publishTime: '2025-09-18T10:25:00Z',
      relativeTime: 'hace 2 semanas'
    },
    {
      rating: 5,
      text: 'Impresión de calendarios con una calidad brutal. Atención de 10.',
      author: 'Javier P.',
      profilePhotoUri: 'https://i.pravatar.cc/64?img=12',
      publishTime: '2025-08-30T08:10:00Z',
      relativeTime: 'hace 1 mes'
    }
    // ... añade si quieres hasta 5
  ]
}

export default defineEventHandler(async (event) => {
  const { placeId, lang = 'es' } = getQuery(event) as { placeId?: string; lang?: string }
  if (!placeId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing placeId' })
  }

  const cfg = useRuntimeConfig(event)
  const useMock = process.env.NUXT_USE_MOCK_REVIEWS === '1' || !cfg.gmapsApiKey

  // TTL de 12 horas para reviews

})

