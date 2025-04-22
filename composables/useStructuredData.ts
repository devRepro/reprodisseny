export function useStructuredData({ title, description, image }: {
    title: string
    description?: string
    image?: string
  }) {
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description: description || '',
      image: image ? `https://reprodisseny.com${image}` : undefined
    })
  }
  