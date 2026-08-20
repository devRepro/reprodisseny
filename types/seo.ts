// types/seo.ts

export interface FormField {
    label: string
    name: string
    type: 'text' | 'number' | 'select'
    required: boolean
    options?: string[]
  }
  
  export interface FaqItem {
    question: string
    answer: string
  }
  