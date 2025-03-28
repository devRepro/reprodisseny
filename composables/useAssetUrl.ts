export function useAssetUrl(subfolder: string, fileName?: string): string {
    // Si no se proporciona fileName, devolver una imagen por defecto o una cadena vacía.
    if (!fileName) {
      return new URL(`../assets/img/${subfolder}/mockup.webp`, import.meta.url).href;
    }
    return new URL(`../assets/img/${subfolder}/${fileName}`, import.meta.url).href;
  }