import type { ContactInfo } from '@/lib/types'

export const contactInfo: ContactInfo = {
  address: 'Carrera 28B No. 71C-14, Bogotá, Colombia',
  phone: '601 4377474',
  whatsapp: '3014897223',
  email: 'clientes@grafivision.com.co',
  schedule: 'Lunes a Viernes: 8:00 AM a 6:00 PM',
  mapsEmbedUrl: import.meta.env.PUBLIC_MAPS_EMBED_URL ?? '',
  social: {
    instagram: 'https://instagram.com/grafivision',
    behance: 'https://behance.net/grafivision',
    linkedin: 'https://linkedin.com/company/grafivision',
  },
}
