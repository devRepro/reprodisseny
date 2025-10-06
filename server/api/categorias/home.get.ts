// server/api/categorias/home.get.ts
import { getQuery, getRequestURL, createError } from 'h3'

function prune(nodes: any[]) {
  return (nodes || []).filter(n => !n.hidden).map(n => ({ ...n, children: prune(n.children || []) }))
}
function flatten(nodes: any[], out: any[] = []) {
  for (const n of nodes) { out.push(n); if (n.children?.length) flatten(n.children, out) }
  return out
}
function pickFeaturedOrTop(tree: any[], limit = 8) {
  const all = flatten(tree)
  const featured = all.filter(n => n.featured)
  if (featured.length >= limit) return featured.slice(0, limit)
  const extra = tree.filter(n => !n.featured)
  return featured.concat(extra).slice(0, limit)
}

export default cachedEventHandler(async (event) => {
  try {
    const n = Number(getQuery(event).limit)
    const limit = Number.isFinite(n) && n > 0 ? n : 8

    const treeRaw = await queryCollectionNavigation(
      event,
      'categorias',
      ['slug','title','nav','order','image','description','featured','hidden','path'] // ← sin "children"
    ).order('order','ASC') // ← sin .all()

    const tree = prune(treeRaw)
    const items = pickFeaturedOrTop(tree, limit)
    return { items }
  } catch (err: any) {
    console.error('[api/categorias/home] error:', err)
    throw createError({ statusCode: 500, statusMessage: 'Categorias home failed', data: { message: String(err?.message || err) } })
  }
}, {
  maxAge: 600,
  swr: true,
  getKey: e => getRequestURL(e).toString()
})
