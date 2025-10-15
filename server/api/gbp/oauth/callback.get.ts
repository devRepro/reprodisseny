export default defineEventHandler(async (event) => {
  const { code } = getQuery(event);
  const { gbp } = useRuntimeConfig();

  if (!code) {
    return sendRedirect(event, '/error?message=AuthorizationFailed', 302);
  }

  try {
    const tokenData: { access_token: string, refresh_token: string, expires_in: number } = await $fetch(
      'https://oauth2.googleapis.com/token',
      {
        method: 'POST',
        body: {
          client_id: gbp.clientId,
          client_secret: gbp.clientSecret,
          code: code.toString(),
          grant_type: 'authorization_code',
          redirect_uri: gbp.redirectUri
        }
      }
    );

    // --- 👇 AQUÍ ESTÁ LA SOLUCIÓN ---
    // Guardamos el access_token en una cookie segura.
    // httpOnly: El JavaScript del cliente no puede leerla (más seguro).
    // maxAge: El tiempo de vida de la cookie en segundos (Google suele dar 3599s).
    setCookie(event, 'gbp_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Usar 'secure' solo en producción (HTTPS)
      sameSite: 'lax',
      maxAge: tokenData.expires_in
    });

    // Opcional pero recomendado: Guarda el refresh_token en tu base de datos,
    // ya que es de larga duración y muy sensible. No lo guardes en una cookie.
    // await saveRefreshTokenToDatabase(userId, tokenData.refresh_token);

    return sendRedirect(event, '/', 302);

  } catch (error) {
    console.error('Error intercambiando el código por token:', error);
    return sendRedirect(event, '/error?message=TokenExchangeFailed', 302);
  }
});
