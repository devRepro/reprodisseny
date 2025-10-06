---
type: producto

# Básicos
title: ''
description: ''         # (si no usas body como descripción corta)
image: ''               # ruta pública (mejor en /public)
alt: ''

# Enriquecimiento / SEO
metatitle: ''
metadescription: ''
keywords: []            # ['pegatinas', 'vinilo']
searchTerms: []         # ['etiquetas adhesivas', 'stickers personalizados']

# Comercio
sku: ''
price: 0
priceCurrency: EUR      # ISO 4217
brand: 'Repro Disseny'  # o "Reprodisseny", pero sé consistente
inStock: true

# Media
galleryImages: []       # ['/img/productos/p1.webp', '/img/productos/p2.webp']

# Opiniones
ratingValue: 0          # 0..5
reviewCount: 0          # entero

# (Opcional) campos de formulario para personalización del producto
formFields: []          # [{ name: 'ancho', label: 'Ancho (cm)', type: 'number', required: true }]

# (Opcional) schema.org (puedes omitirlo y generarlo en runtime)
schema:
  "@type": "Product"
  name: ''
  description: ''
  image: ''
  sku: ''
  brand:
    "@type": "Organization"
    name: "Repro Disseny"
  offers:
    "@type": "Offer"
    price: 0
    priceCurrency: "EUR"
    availability: "https://schema.org/InStock"
---

