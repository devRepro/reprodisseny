---
title: 'Tarjetas de visita'
slug: 'tarjetas-de-visita'
category: 'libros'
type: 'producto'

# Descripción única (sirve también como metadescripción SEO)
description: 'Tarjetas de visita personalizadas con múltiples acabados y gramajes de papel.'

# Imagen principal del producto
image: '/img/productos/tarjetas-de-visita.webp'
alt: 'Tarjetas de visita personalizadas por Repro Disseny'

# Meta title para SEO (si quieres usar uno más largo o específico)
metatitle: 'Tarjetas de visita con acabados premium | Repro Disseny'

# ⚠️ metadescription es opcional. Si no lo incluyes, se usará `description` como fallback.
# metadescription: ''

# Tags o palabras clave internas (opcional)
tags: ['Papelería', 'Impresión']

# Navegación (para mostrar u ocultar el producto en listados)
navigation: true

# 📦 Campos ecommerce (opcional por ahora, pero ya definidos en el schema)
sku: '01-TARVIS-350'
price: 0.25
priceCurrency: 'EUR'
inStock: true
brand: 'Reprodisseny'

# 🎯 Schema.org (recomendado para rich snippets en Google)
schema:
  "@type": "Product"
  name: 'Tarjetas de visita personalizadas'
  description: 'Tarjetas de visita personalizadas con múltiples acabados y gramajes de papel.'
  image: '/img/productos/tarjetas-de-visita.webp'
  sku: '01-TARVIS-350'
  brand:
    "@type": "Organization"
    name: 'Reprodisseny'
  offers:
    "@type": "Offer"
    price: 0.25
    priceCurrency: 'EUR'
    availability: "https://schema.org/InStock"

formFields:
  - label: 'Cantidad'
    name: 'cantidad'
    type: 'number'
    required: true
  - label: 'Acabado'
    name: 'acabado'
    type: 'select'
    required: true
    options: ['Soft Touch', 'Elegante', 'Reciclado']
  - label: 'Peso del papel'
    name: 'gramaje'
    type: 'select'
    required: true
    options: ['300 gr', '350 gr']
  - label: 'Nombre para el pedido'
    name: 'nombre_archivo'
    type: 'text'
    required: false
---
