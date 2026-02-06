type ImageDto = { src: string; alt?: string; width?: number; height?: number } | null

export type HomeCategoryGridItem = {
  id?: string
  slug: string
  path: string
  title: string
  image: ImageDto
  order?: number
}

export function useHomeCategoriesGrid(limit = 8) {
  return useFetch<HomeCategoryGridItem[]>("/api/cms/home-categories", {
    key: `home-categories-grid:${limit}`,
    server: true,
    default: () => [],
    params: { limit },
  })
}

