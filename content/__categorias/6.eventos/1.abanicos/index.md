---
title: 'Abanicos'
slug: 'abanicos'
category: 'eventos'
type: 'producto'

# Descripción única (sirve también como metadescripción SEO)
description: 'Abanicos personalizados para eventos.'

# Imagen principal del producto
image: '/img/productos/abanico.webp'
alt: 'Abanicos personalizados producidos por Repro Disseny'

# Meta title para SEO (si quieres usar uno más largo o específico)
metatitle: 'Abanicos personalizados para eventos | Repro Disseny'

# ⚠️ metadescription es opcional. Si no lo incluyes, se usará `description` como fallback.
# metadescription: ''

# Tags o palabras clave internas (opcional)
tags: ['Eventos']

# Navegación (para mostrar u ocultar el producto en listados)
navigation: true

# 📦 Campos ecommerce (opcional por ahora, pero ya definidos en el schema)
sku: '06-ABANI-001'
price: 8.9
priceCurrency: 'EUR'
inStock: true
brand: 'Reprodisseny'

# 🎯 Schema.org (recomendado para rich snippets en Google)
schema:
  "@type": "Product"
  name: 'Abanicos personalizados'
  description: 'Abanicos personalizados para eventos.'
  image: '/img/productos/abanico.webp'
  sku: '06-ABANI-001'
  brand:
    "@type": "Organization"
    name: 'Reprodisseny'
  offers:
    "@type": "Offer"
    price: 8.9
    priceCurrency: 'EUR'
    availability: "https://schema.org/InStock"

formFields:
  - label: 'Cantidad'
    name: 'cantidad'
    type: 'number'
    required: true
  - label: 'Color del abanico'
    name: 'color'
    type: 'select'
    required: true
    options: ['Blanco', 'Negro', 'Rojo', 'Azul']
  - label: 'Texto personalizado'
    name: 'texto'
    type: 'text'
    required: false
---
