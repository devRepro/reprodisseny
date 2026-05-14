// types/content.ts
import type { Categoria, Subcategoria, Producto } from "./catalog"
import type {
  CategoryDetailSectionItem,
  ProductDetailSectionItem,
  CategoryCardGroup,
  CategoryCardItem,
} from "~/server/services/cms/catalog.service"

/** Metadatos comunes que expone Nuxt Content en documentos renderizables */
export interface ContentDocBase {
  _path: string
  _id?: string
  title?: string
  body?: unknown
}

/** Sección renderizable de categoría o producto */
export type ContentSection = CategoryDetailSectionItem | ProductDetailSectionItem

/** Tipos reutilizables por los componentes de contenido */
export type ContentCardGroup = CategoryCardGroup
export type ContentCardItem = CategoryCardItem

/** Documento de categoría renderizable desde Nuxt Content */
export type CategoriaDoc = ContentDocBase &
  Partial<Categoria> & {
    sections?: ContentSection[]
  }

/** Documento de subcategoría renderizable desde Nuxt Content */
export type SubcategoriaDoc = ContentDocBase &
  Partial<Subcategoria> & {
    sections?: ContentSection[]
  }

/** Documento de producto renderizable desde Nuxt Content */
export type ProductoDoc = ContentDocBase &
  Partial<Producto> & {
    sections?: ContentSection[]
  }