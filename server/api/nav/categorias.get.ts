import { getQuery } from "h3"
import {
  getNavigationCategories,
  type NavCategoryItem,
} from "~/server/services/cms/catalog.service"

type ReturnShape = {
  tree: NavCategoryItem[]
  indexBySlug: Record<string, NavCategoryItem>
  menuItems: NavCategoryItem[]
}

function buildIndexBySlug(
  nodes: NavCategoryItem[],
  acc: Record<string, NavCategoryItem> = {}
) {
  for (const node of nodes) {
    acc[node.slug] = node

    if (node.children.length) {
      buildIndexBySlug(node.children, acc)
    }
  }

  return acc
}

export default defineEventHandler((event): ReturnShape => {
  const query = getQuery(event)
  const productLimit = Math.max(
    0,
    Math.min(Number(query.productLimit ?? 8) || 8, 12)
  )

  const tree = getNavigationCategories(productLimit)
  const indexBySlug = buildIndexBySlug(tree)

  return {
    tree,
    indexBySlug,
    menuItems: tree,
  }
})