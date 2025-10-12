---
type: producto

# Identificación
slug: ""                 # opcional (si falta, se infiere del nombre del archivo)
categorySlug: ""         # REQUERIDO: slug de la categoría (sin '/categorias/')

# Básicos
title: ""
description: ""          # resumen corto (el body puede ampliar)
image:                   # reservar espacio evita CLS
  src: ""                # ej. /img/productos/adhesivo.webp
  width: 1200
  height: 800
alt: ""

# Media
galleryImages: []        # puedes mantener strings o migrar a objetos {src,width,height}

# Comercio
sku: ""
mpn: ""                  # opcional, si procede
gtin13: ""               # opcional, si existe
brand: "Repro Disseny"
price: 0                 # precio base visible/legible
priceCurrency: EUR       # ISO 4217
inStock: true            # controla disponibilidad (Offer.availability)

# Opiniones (si las hay)
ratingValue: 0           # 0..5
reviewCount: 0

# Atributos/variantes (opcional, útil en impresión)
attributes:              # mapea a schema.org > additionalProperty
  - name: ""             # p.ej. "Material"
    value: ""            # p.ej. "Vinilo polimérico"
variants: []             # [{ sku, title, price, attributes: [{name,value}] }]

# Formularios (opcional)
formFields: []           # [{ name:'ancho', label:'Ancho (cm)', type:'number', required:true }]

# SEO
metaTitle: ""            # conciso + marca
metaDescription: ""      # claro; Google puede reescribir
canonical: ""            # ponla si hay duplicados/variantes
hreflang:
  - { lang: "es-ES", url: "" }
  - { lang: "ca-ES", url: "" }
keywords: []             # interno (Google no usa meta keywords)
searchTerms: []          # para tu buscador/SEM

# Schema.org (opcional; también puedes generarlo en runtime)
schema:
  "@type": "Product"
  name: ""
  description: ""
  image: ""
  sku: ""
  brand:
    "@type": "Organization"
    name: "Repro Disseny"
  offers:
    "@type": "Offer"
    price: 0
    priceCurrency: "EUR"
    availability: "https://schema.org/InStock"
---
