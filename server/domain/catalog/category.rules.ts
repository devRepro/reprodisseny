// server/mappers/cms/category.mapper.ts
export function mapCmsCategory(fields: any): CmsCategory {
    return {
      id: String(fields.id),
      slug: String(fields.CategorySlug ?? fields.Slug ?? "").trim(),
      title: String(fields.NavLabel ?? fields.Title ?? "").trim(),
      path: resolveCategoryPath(fields),
      featured: Boolean(fields.IsFeatured ?? fields.Featured),
      hidden: Boolean(fields.IsHidden ?? fields.Hidden),
      isPublished: fields.IsPublished !== false,
      image: mapImage(fields),
      order: Number(fields.SortOrder ?? fields.Order ?? 0),
    }
  }