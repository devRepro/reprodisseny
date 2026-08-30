export type NavigationProductDto = {
  title: string;
  path: string;
  imageSrc?: string;
};

export type NavigationCategoryDto = {
  label: string;
  path: string;
  children: NavigationCategoryDto[];
  products: NavigationProductDto[];
};

type NavigationSourceProduct = {
  title: string;
  path: string;
  image?: { src?: string | null } | null;
};

type NavigationSourceCategory = {
  title: string;
  nav?: string;
  path: string;
  children: NavigationSourceCategory[];
  products: NavigationSourceProduct[];
};

export function toNavigationDto(
  categories: NavigationSourceCategory[],
): NavigationCategoryDto[] {
  return categories.map((category) => ({
    label: category.nav || category.title,
    path: category.path,
    children: toNavigationDto(category.children),
    products: category.products.map((product) => ({
      title: product.title,
      path: product.path,
      ...(product.image?.src ? { imageSrc: product.image.src } : {}),
    })),
  }));
}
