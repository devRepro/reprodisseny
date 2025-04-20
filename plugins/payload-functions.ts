// plugins/payload-functions.ts
export default definePayloadPlugin((nuxtApp) => {
    // Reducimos las funciones a un string (o a null) para que devalue no pete
    definePayloadReducer('Function', (val) => {
      if (typeof val === 'function') {
        return val.toString()   // O devuelve null si prefieres
      }
    })
    // (Opcional) Si luego necesitas reconstruir algo al hydratar, defines el reviver:
    definePayloadReviver('Function', (str) => {
      // por seguridad devolvemos una función vacía
      return () => {}
    })
  })
  