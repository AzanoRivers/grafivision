import type { Service } from '@/lib/types'

export const services: Service[] = [
  {
    id: 'offset',
    title: 'Impresión Offset',
    description:
      'Producción de material impreso de alta calidad: revistas, cartillas, folletos, tarjetas, invitaciones y bolsas con acabados profesionales que fortalecen la identidad visual de las marcas.',
    icon: 'Printer',
    featured: true,
  },
  {
    id: 'digital',
    title: 'Impresión Digital',
    description:
      'Impresión digital de alta calidad con tecnología Indigo, ideal para tirajes cortos, material corporativo y piezas personalizadas con excelente definición y precisión de color.',
    icon: 'Monitor',
    featured: true,
  },
  {
    id: 'gran-formato',
    title: 'Impresión Gran Formato',
    description:
      'Impresión en banner, vinilo, microperforado y backlite para pendones, tropezones, floorgraphics y exhibidores de gran impacto visual.',
    icon: 'Maximize',
    featured: true,
  },
  {
    id: 'pop',
    title: 'Material POP',
    description:
      'Saltarines, móviles, cenefas, flangers, afiches y volantes diseñados para aumentar la visibilidad de las marcas en el punto de venta.',
    icon: 'Star',
    featured: true,
  },
  {
    id: 'empaques',
    title: 'Empaques',
    description:
      'Diseño y producción de empaques funcionales, promocionales y premium, adaptados a las necesidades del producto y del mercado.',
    icon: 'Package',
    featured: false,
  },
  {
    id: 'rigidos',
    title: 'Impresión en Rígidos',
    description:
      'Impresión directa sobre sustratos rígidos de gran formato con el Roland EU-1000MF. Materiales de hasta 2440 mm × 1220 mm con alta precisión de color.',
    icon: 'Layers',
    featured: false,
  },
  {
    id: 'screen',
    title: 'Serigrafía',
    description:
      'Impresión serigráfica para textiles, piezas especiales y materiales no convencionales. Ideal para producciones que requieren tintas de alta opacidad y durabilidad.',
    icon: 'Grid',
    featured: false,
  },
  {
    id: 'acabados',
    title: 'Acabados y Terminados',
    description:
      'Troquelado, plastificado, plegado, ruteado, refilado, ensamblaje y acabados manuales. El toque final que eleva la calidad de cada pieza impresa.',
    icon: 'Scissors',
    featured: false,
  },
  {
    id: 'distribucion',
    title: 'Distribución e Instalación',
    description:
      'Distribución, instalación y retiro de material publicitario en todo el territorio nacional. Contamos con personal certificado para trabajo en alturas.',
    icon: 'Truck',
    featured: false,
  },
]
