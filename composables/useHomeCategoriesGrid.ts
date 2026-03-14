type ImageDto = {
  src: string
  alt?: string
  width?: number
  height?: number
} | null

type HomeCategoryCardDto = {
  id: string
  slug: string
  title: string
  href: string
  image: ImageDto
  order: number
}

export function useHomeCategoriesGrid(limit = 8) {
  return useFetch<HomeCategoryCardDto[]>("/api/home/categorias", {
    key: `home-categorias-${limit}`,
    server: true,
    query: { limit },
    default: () => [],
  })
}