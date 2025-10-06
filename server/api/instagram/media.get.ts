import { defineEventHandler, createError } from 'h3'

import type { IgMediaResponse } from '~/types/instagram'

const MOCK: IgMediaResponse = {
  data: [
    {
      id: 'MOCK1',
      media_type: 'IMAGE',
      media_url: 'https://picsum.photos/seed/ig1/1200/1200',
      permalink: 'https://instagram.com/p/XXXXXXXXX/',
      caption: 'Calendarios 2026 listos 💥',
      timestamp: '2025-09-18T10:25:00Z',
      username: 'repro_disseny'
    },
    {
      id: 'MOCK2',
      media_type: 'VIDEO',
      media_url: 'https://filesamples.com/samples/video/mp4/sample_960x540.mp4',
      thumbnail_url: 'https://picsum.photos/seed/ig2/1200/1200',
      permalink: 'https://instagram.com/reel/YYYYYYYYY/',
      caption: 'Vinilo microperforado en acción 🎬',
      timestamp: '2025-09-02T08:10:00Z',
      username: 'repro_disseny'
    }
  ]
}

export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig(event)
  const useMock = process.env.NUXT_IG_USE_MOCK === '1' || !cfg.igToken || !cfg.igUserId


})
