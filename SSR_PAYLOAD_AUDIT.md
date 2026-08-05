# Auditoría del peso SSR inicial

Fecha: 2026-08-05

## Método reproducible

Las mediciones se realizaron con Node 20.20.2 sobre un build de producción local
servido desde `.output/server/index.mjs` en `127.0.0.1:3000`. Los bytes son bytes
UTF-8 de la respuesta; `HTML gzip` usa `gzipSync` sobre esa misma respuesta. El
JavaScript inicial es la suma sin comprimir de los `script[src]` del documento y
el DOM es un recuento aproximado de etiquetas HTML del SSR. Los tiempos locales
son solo orientativos.

La ficha corta de comparación es `/productos/cupones-promocionales`.

## Línea base

| Ruta | HTTP | HTML | HTML gzip | Payload Nuxt | JS inicial | Scripts | CSS enlazadas | Imágenes (eager) | Nodos aprox. | Tiempo local |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 200 | 467.267 B | 75.521 B | 56.836 B | 426.875 B | 8 | 1 | 46 (4) | 709 | 251,4 ms |
| `/categorias/gran-formato` | 200 | 507.736 B | 82.949 B | 69.639 B | 426.875 B | 8 | 2 | 21 (3) | 848 | 233,4 ms |
| `/productos/banderolas-personalizadas` | 200 | 471.202 B | 74.248 B | 50.290 B | 426.875 B | 8 | 2 | 5 (4) | 746 | 205,5 ms |
| `/productos/cupones-promocionales` | 200 | 472.300 B | 74.265 B | 50.286 B | 426.875 B | 8 | 2 | 5 (4) | 751 | 137,6 ms |
| `/buscar` | 200 | 395.935 B | 64.131 B | 50.379 B | 426.875 B | 7 | 1 | 2 (2) | 236 | 140,6 ms |

## Diagnóstico cuantificado

Cada página incluía directamente dos bloques CSS globales de 115.651 B y
186.481 B: 302.132 B repetidos en cada documento. En la ficha de banderolas son
aproximadamente el 64 % del HTML sin comprimir. Su payload Nuxt mide 50.290 B y
el JSON-LD 1.727 B, por lo que ninguno es la causa principal de los 471 KB.

El HTML comercial, navegación, formulario, breadcrumbs, productos relacionados,
metadatos y JSON-LD se mantuvieron. La única optimización activa
(`features.inlineStyles: false`) extrae el CSS del HTML a recursos estáticos
cacheables.

## Medición final

| Ruta | HTTP | HTML | HTML gzip | Payload Nuxt | JS inicial | Scripts | CSS enlazadas | Imágenes (eager) | Nodos aprox. | Tiempo local |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 200 | 164.702 B | 27.306 B | 56.836 B | 426.875 B | 8 | 2 | 46 (4) | 708 | 2.640 ms |
| `/categorias/gran-formato` | 200 | 202.652 B | 34.433 B | 69.639 B | 426.875 B | 8 | 3 | 21 (3) | 845 | 435,6 ms |
| `/productos/banderolas-personalizadas` | 200 | 164.390 B | 25.517 B | 50.290 B | 426.875 B | 8 | 3 | 5 (4) | 743 | 353,5 ms |
| `/productos/cupones-promocionales` | 200 | 165.488 B | 25.521 B | 50.286 B | 426.875 B | 8 | 3 | 5 (4) | 748 | 216,3 ms |
| `/buscar` | 200 | 92.979 B | 16.054 B | 50.379 B | 426.875 B | 7 | 3 | 2 (2) | 235 | 179,7 ms |

Los tiempos incluyen calentamiento y variabilidad local; no se atribuye una
mejora de tiempo de respuesta al cambio.

## Reducción comprobada

| Ruta | Reducción HTML | Reducción HTML | Reducción gzip | Reducción gzip |
| --- | ---: | ---: | ---: | ---: |
| `/` | 302.565 B | 64,76 % | 48.215 B | 63,85 % |
| `/categorias/gran-formato` | 305.084 B | 60,09 % | 48.516 B | 58,49 % |
| `/productos/banderolas-personalizadas` | 306.812 B | 65,11 % | 48.731 B | 65,63 % |
| `/productos/cupones-promocionales` | 306.812 B | 64,96 % | 48.744 B | 65,63 % |
| `/buscar` | 302.956 B | 76,52 % | 48.077 B | 74,98 % |

Payload Nuxt, JavaScript, scripts, imágenes y DOM permanecen materialmente
iguales. El número de enlaces CSS aumenta porque los estilos dejan de repetirse
dentro de cada documento y pasan a recursos compartidos cacheables.
