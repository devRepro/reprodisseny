import { EDITORIAL_LANDING_PATHS, PUBLICATIONS_PATH } from './seo/editorialRoutes';

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
  commercialLinks?: NavigationProductDto[];
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
    ...(category.path === PUBLICATIONS_PATH ? {commercialLinks: [
      {title: 'Impresión de catálogos', path: EDITORIAL_LANDING_PATHS.catalogos},
      {title: 'Impresión de revistas', path: EDITORIAL_LANDING_PATHS.revistas},
    ]} : {}),
    products: category.products.map((product) => ({
      title: product.title,
      path: product.path,
      ...(product.image?.src ? { imageSrc: product.image.src } : {}),
    })),
  }));
}
