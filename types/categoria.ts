export interface FormField {
  label: string
  name: string
  type: 'text' | 'number' | 'select'
  required: boolean
  options?: string[]
}

export interface Categoria {
  title: string
  navigation?: boolean
  nav: string
  slug: string
  description: string
  keywords?: string[]
  image?: string
  alt?: string
  type?: 'categoria' | 'producto'
  path: string

  // ✅ Nuevo campo para productos que contienen formulario
  formFields?: FormField[]
}
