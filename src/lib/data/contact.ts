import type { ContactInfo } from '@/lib/types'

export const contactInfo: ContactInfo = {
  address: 'Carrera 28B No. 71C-14, Bogotá, Colombia',
  phone: '601 437 7474',
  mobile: '304 289 6066',
  whatsapp: '3014897223',
  email: 'clientes@grafivision.com.co',
  schedule: 'Lun.\u2013Vie.: 7:30\u201317:30 \u00b7 S\u00e1b.: 8:30\u201312:00',
  mapsEmbedUrl: import.meta.env.PUBLIC_MAPS_EMBED_URL ?? '',
  social: {
    instagram: 'https://www.instagram.com/grafivision_editores',
  },
}
