---
type: categoria

# ------------------------------
# Básicos y navegación
# ------------------------------
title: ""               # Visible en H1/Hero
nav: ""                 # Texto de menú (opcional)
order: 0
parent: ""              # slug de categoría padre (si aplica)
featured: false
hidden: false

# ------------------------------
# Contenido / UX
# ------------------------------
description: ""         # Resumen (también se usa como fallback de metaDescription)
image:
  src: ""               # Ej: /img/categorias/adhesivos.webp (o PNG/JPG si no hay WebP/AVIF)
  width: 1200           # Define width/height para evitar CLS
  height: 800
alt: ""                 # Alt descriptivo (sin keyword stuffing)
galleryImages: []
breadcrumbs:
  - { name: "Inicio", url: "/" }
  # - { name: "Padre", url: "/categorias/padre" }
  # - { name: "Actual", url: "/categorias/actual" }
cta: { text: "Ver Productos", link: "#productos" }

# ------------------------------
# SEO
# ------------------------------
metaTitle: ""           # Conciso + marca; evita duplicados
metaDescription: ""     # Resumen claro; no se verá siempre, pero ayuda
canonical: ""           # Solo si hay duplicados/variantes; si no, deja vacío
hreflang:
  - { lang: "es-ES", url: "" }
  - { lang: "ca-ES", url: "" }
keywords: []            # Úsalo interno; Google no usa meta keywords
searchTerms: []         # Útil para tu propio buscador/SEM
faqs:
  - { question: "", answer: "" }

# ------------------------------
# Schema.org (puedes complementar dinámicamente)
# ------------------------------
schema:
  "@type": "CollectionPage"
  name: ""
  description: ""
---


# Título del Contenido Principal (H1)

Aquí puedes desarrollar el contenido principal de la categoría. Este texto es crucial para el **SEO** y para aportar **valor al usuario**.

## Subtítulo (H2)

Explica los diferentes tipos de productos, casos de uso, o ventajas de esta categoría. Utiliza subtítulos (`##`, `###`) para estructurar la información de forma clara y legible.