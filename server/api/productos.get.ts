// /server/api/productos/qc.get.ts
import { defineEventHandler, getQuery } from 'h3'

type SortKey = 'order' | 'title' | 'price'
type Dir = 'ASC' | 'DESC'

export default defineEventHandler(async (event) => {


  const q = getQuery(event)
  const slug = String(q.slug || '').trim()
  const includeSub = String(q.includeSub ?? 'true') === 'true'
  const limit = Math.max(1, Math.min(100, Number(q.limit ?? 24)))
  const page = Math.max(1, Math.floor(Number(q.page ?? 1)))
  const sort = (String(q.sort || 'order') as SortKey)
  const direction = (String(q.direction || 'ASC').toUpperCase() as Dir)
  const qClient = String(q.q || '').trim().toLowerCase()

  if (!slug) {
    return { items: [], total: 0, page: 1, pages: 0, limit, sort, direction }
  }

  const fields = [
    'id','slug','title','order','price','image','description',
    'categorySlug','subcategorySlug','path','tags','hidden'
  ] as const

  // ➜ Ahora sí: filtramos por hidden en la query
  const base = () => queryCollection('productos').where('hidden','!=',true)

  const a = await base().where('categorySlug','=',slug).select(...fields).all()
  const b = includeSub
    ? await base().where('subcategorySlug','=',slug).select(...fields).all()
    : []

  // merge + dedupe
  const seen = new Set<string>()
  let merged = [...(a||[]), ...(b||[])].filter((it: any) => {
    const k = String(it?.id ?? it?.slug ?? '')
    if (!k) return true
    if (seen.has(k)) return false
    seen.add(k); return true
  })

  // filtro cliente
  if (qClient) {
    merged = merged.filter((it: any) => {
      const t = String(it?.title || '').toLowerCase()
      const d = String(it?.description || '').toLowerCase()
      const tags = Array.isArray(it?.tags) ? it.tags.join(' ').toLowerCase() : ''
      return t.includes(qClient) || d.includes(qClient) || tags.includes(qClient)
    })
  }

  // sort
  const dir = direction === 'ASC' ? 1 : -1
  merged.sort((x:any, y:any) => {
    if (sort === 'title') return String(x?.title||'').localeCompare(String(y?.title||'')) * dir
    if (sort === 'price') return (Number(x?.price||0) - Number(y?.price||0)) * dir
    return (Number(x?.order||0) - Number(y?.order||0)) * dir
  })

  const total = merged.length
  const pages = total ? Math.max(1, Math.ceil(total / limit)) : 0
  const currentPage = Math.min(page, Math.max(1, pages || 1))
  const offset = (currentPage - 1) * limit

  const pageItems = merged.slice(offset, offset + limit).map((p:any) => ({
    ...p,
    path: p?.path?.startsWith?.('/api/')
      ? (p?.slug ? `/productos/${p.slug}` : null)
      : (p?.path || (p?.slug ? `/productos/${p.slug}` : null)),
    image: p?.image || '/img/placeholder-product.jpg'
  }))

  return { items: pageItems, total, page: currentPage, pages, limit, sort, direction }
})
