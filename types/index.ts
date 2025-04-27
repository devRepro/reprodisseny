// types/index.ts (ACTUALIZADO PARA COINCIDIR CON SUS EJEMPLOS)

export interface FormField {
  label: string;
  name: string;
  type: 'text' | 'number' | 'select';
  required: boolean;
  options?: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SchemaOrgBrand {
  '@type': 'Organization';
  name: string;
}

export interface SchemaOrgOffer {
  '@type': 'Offer';
  price: number;
  priceCurrency: string;
  availability: string;
}

// Tipo base para Schema.org, puede ser extendido
export interface BaseSchema {
    '@type': string; // 'Product', 'CollectionPage', etc.
    name?: string;
    description?: string;
    image?: string | string[];
    url?: string; // Añadido, presente en ejemplo Subcategoria schema
    brand?: SchemaOrgBrand;
    offers?: SchemaOrgOffer | SchemaOrgOffer[]; // Puede haber múltiples offers
    // ... otros campos comunes de Schema.org
}

// Producto usa un Schema con campos específicos (sku, offers, etc.)
export interface ProductSchema extends BaseSchema {
    '@type': 'Product';
    sku?: string;
    offers?: SchemaOrgOffer | SchemaOrgOffer[];
    // ... otros campos específicos de Product Schema
}

// Categoria/Subcategoria pueden usar un Schema más genérico o de CollectionPage
export interface CollectionPageSchema extends BaseSchema {
     '@type': 'CollectionPage';
     // ... otros campos específicos de CollectionPage Schema
}


export interface Producto {
  id?: string | number;
  title: string;
  slug: string; // Único
  category: string; // Slug de la categoría padre
  description: string;
  keywords?: string[] | string;
  image: string; // Ruta a la imagen principal
  alt?: string;
  tags?: string[];
  navigation?: boolean;
  metatitle?: string; // Título para SEO
  metadescription?: string; // Descripción para SEO
  type: 'producto'; // Asegura el tipo
  sku: string; // SKU es obligatorio en producto según el tipo
  price?: number;
  priceCurrency?: string;
  inStock?: boolean;
  brand?: string; // Nombre de la marca (string simple)
  path: string; // Ruta completa (debe existir o ser añadida)
  formFields?: FormField[];
  schema?: ProductSchema | BaseSchema; // Usa el tipo ProductSchema o BaseSchema
  nav?: string; // Texto de navegación/enlace
  faqs?: FaqItem[]; // FAQs específicas del producto
  galleryImages?: string[] | any[]; // Galería de imágenes
  ratingValue?: number; // del 0 al 5?
  reviewCount?: number; // Número de reviews
  searchTerms?: string[];
  // Campos del ejemplo de Categoria/Subcategoria que NO deberían estar en Producto (si los limpiaste)
  // schemaType?: string; featured?: boolean; order?: number;
  // structuredData?: Record<string, any>; // No usar si se usa 'schema'
}

// Subcategoria DEBE tener campos similares a Categoria para que el template común funcione
export interface Subcategoria {
  id?: string | number;
  title: string;
  slug: string; // Único
  type: 'subcategoria'; // Asegura el tipo
  path: string; // Ruta completa
  category: string; // Slug de la categoría padre

  // --- CAMPOS QUE FALTABAN/ERAN GENERICOS PERO ESTÁN EN TUS EJEMPLOS DE SUBATEGORÍA ---
  navigation?: boolean;
  nav: string; // Texto de navegación/enlace
  description: string;
  keywords?: string[] | string;
  image?: string; // Ruta a la imagen (opcional?)
  alt?: string;
  metatitle?: string; // Título para SEO
  metaDescription?: string; // Descripción para SEO
  faqs?: FaqItem[]; // FAQs
  schema?: CollectionPageSchema | BaseSchema | Record<string, any>; // Schema de colección o genérico
  galleryImages?: string[] | any[]; // Galería
  ratingValue?: number; reviewCount?: number; searchTerms?: string[]; brand?: string;
  //------------------------------------------------------------------------------------

  children?: Producto[]; // Para el menú/estructura, no para la vista de página actual
  formFields?: FormField[]; // Si las subcategorías pueden tener formularios
  // Posiblemente campos como featured, order si aplican a subcategorías
  featured?: boolean;
  order?: number;

  // Eliminar [key: string]: any si defines todos los campos esperados
  // [key: string]: any; // <-- Preferiblemente evitar si conoces la estructura
}

export interface Categoria {
  id?: string | number;
  title: string;
  navigation?: boolean; // Usado para menús?
  nav: string; // Texto de navegación/enlace
  slug: string; // Único
  description: string;
  keywords?: string[] | string;
  image?: string; // Ruta a la imagen (opcional?)
  alt?: string;
  type: 'categoria'; // Asegura el tipo
  path: string; // Ruta completa
  formFields?: FormField[];
  // Usamos 'schema' aquí para coincidir con tu ejemplo, y usamos el tipo CollectionPageSchema o BaseSchema
  schema?: CollectionPageSchema | BaseSchema | Record<string, any>; // Schema de colección o genérico
  metaTitle?: string; // Título para SEO (del ejemplo)
  metaDescription?: string; // Descripción para SEO (del ejemplo)
  faqs?: FaqItem[]; // FAQs de categoría (del ejemplo)

  // --- CAMPOS PRESENTES EN TU EJEMPLO DE CATEGORIA QUE PUEDEN O NO SER SIEMPRE RELEVANTES/PRESENTES ---
  category?: string | null; // Vacío/null si es raíz (del ejemplo - puede no ser necesario en tipo Categoria)
  sku?: string; price?: number; priceCurrency?: string; brand?: string; inStock?: boolean; // Del ejemplo
  ratingValue?: number; reviewCount?: number; // Del ejemplo
  schemaType?: string; featured?: boolean; order?: number; // Del ejemplo
  galleryImages?: string[] | any[]; searchTerms?: string[]; // Del ejemplo
  // structuredData?: Record<string, any>; // No usar si se usa 'schema'
  // children?: (Producto | Subcategoria)[]; // Para el menú
}