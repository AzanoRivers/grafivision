/**
 * Catálogo de productos por categoría.
 *
 * Para agregar imágenes:
 *  1. Copia el archivo a public/images/productos/<categoria>/
 *  2. Agrega la ruta al array correspondiente abajo.
 *
 * Rutas de carpetas:
 *  public/images/productos/offset/
 *  public/images/productos/digital/
 *  public/images/productos/gran-formato/
 *  public/images/productos/pop/
 *  public/images/productos/empaques/
 */

export interface ProductCategory {
  id:     string
  label:  string
  images: string[]
}

// ── Demo: imágenes temporales de /images/portfolio/Foto-*.webp ──────────────
// Reemplaza con las rutas reales al poblar las carpetas de categoría.

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => `/images/portfolio/Foto-${from + i}.webp`)

export const productCategories: ProductCategory[] = [
  {
    id:     'offset',
    label:  'Impresión Offset',
    images: range(1, 31),
  },
  {
    id:     'digital',
    label:  'Impresión Digital',
    images: range(32, 62),
  },
  {
    id:     'gran-formato',
    label:  'Gran Formato',
    images: range(63, 93),
  },
  {
    id:     'pop',
    label:  'Material POP',
    images: range(94, 124),
  },
  {
    id:     'empaques',
    label:  'Empaques',
    images: range(125, 155),
  },
]

/** Todas las categorías combinadas (para la pestaña "Todos") */
export const allProductImages: string[] = productCategories.flatMap(c => c.images)
