// server/api/google-reviews.ts

// Datos de prueba (mock)
const mockReviews = [
  {
    author_name: 'Ana López',
    profile_photo_url: 'https://lh3.googleusercontent.com/a-/ALV-UjX_3gbe_3gY-V_3gbe_3gY-V_3gbe_3gY-V_3gbe=s128-c0x00000000-cc-rp-mo',
    rating: 5,
    relative_time_description: 'hace 3 semanas',
    text: '¡Trato inmejorable y gran profesionalidad! Resolvieron todas mis dudas con paciencia y eficacia. ¡100% recomendado!',
    time: 1726848000,
  },
  {
    author_name: 'David Martín',
    profile_photo_url: 'https://lh3.googleusercontent.com/a-/ALV-UjX_3gbe_3gY-V_3gbe_3gY-V_3gbe_3gY-V_3gbe=s128-c0x00000000-cc-rp-mo',
    rating: 4,
    relative_time_description: 'hace un mes',
    text: 'Buen servicio y buenos resultados. El proceso fue un poco más lento de lo que esperaba, pero el resultado final valió la pena.',
    time: 1726243200,
  },
  {
    author_name: 'Laura Jiménez',
    profile_photo_url: 'https://lh3.googleusercontent.com/a-/ALV-UjX_3gbe_3gY-V_3gbe_3gY-V_3gbe_3gY-V_3gbe=s128-c0x00000000-cc-rp-mo',
    rating: 5,
    relative_time_description: 'hace 2 meses',
    text: 'Fantástica experiencia de principio a fin. El equipo es muy amable y el resultado superó mis expectativas.',
    time: 1723564800,
  },
];

export default defineEventHandler(async () => {
  // Leemos las variables de entorno
  const { GOOGLE_PLACES_API_KEY, GOOGLE_PLACE_ID, USE_MOCK_DATA } = process.env;

  // Si USE_MOCK_DATA es 'true', devolvemos los datos de prueba
  if (USE_MOCK_DATA === 'true') {
    console.log('✅ Devolviendo datos de prueba (mock) para las reseñas.');
    return mockReviews;
  }

  // Si no, procedemos con la llamada real a la API
  console.log('⚡ Realizando llamada real a la API de Google Places.');

  if (!GOOGLE_PLACES_API_KEY || !GOOGLE_PLACE_ID) {
    throw createError({
      statusCode: 500,
      statusMessage: 'La API Key o el Place ID de Google no están configurados en el archivo .env',
    });
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${GOOGLE_PLACE_ID}&key=${GOOGLE_PLACES_API_KEY}&fields=name,rating,reviews&language=es`;

  try {
    const response = await $fetch<{ result?: { reviews: any[] }; status: string }>(url);

    if (response.status !== 'OK' || !response.result?.reviews) {
      throw new Error('Respuesta inválida de la API de Google Places');
    }

    return response.result.reviews;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Error al obtener las reseñas de Google: ${error.message}`,
    });
  }
});