/* ─── Media ─────────────────────────────────────────────────── */

export interface MediaImage {
  src: string
  alt: string
  width?: number
  height?: number
}

/* ─── Navigation ────────────────────────────────────────────── */

export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}

/* ─── Portfolio ─────────────────────────────────────────────── */

export type PortfolioCategory =
  | 'offset'
  | 'digital'
  | 'gran-formato'
  | 'pop'
  | 'empaques'
  | 'todos'

export interface PortfolioItem {
  slug: string
  title: string
  category: PortfolioCategory
  thumbnail: string
  images: string[]
  description?: string
  client?: string
  year: number
  featured?: boolean
}

/* ─── Services ──────────────────────────────────────────────── */

export interface Service {
  id: string
  title: string
  description: string
  icon: string
  featured?: boolean
}

/* ─── Team ──────────────────────────────────────────────────── */

export interface SocialLinks {
  instagram?: string
  linkedin?: string
  behance?: string
  dribbble?: string
  twitter?: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  bio?: string
  photo: string
  social?: SocialLinks
}

/* ─── Stats ─────────────────────────────────────────────────── */

export interface StatItem {
  value: number
  suffix?: string
  label: string
  icon?: string
}

/* ─── Testimonials ──────────────────────────────────────────── */

export interface Testimonial {
  id: string
  quote: string
  author: string
  company?: string
  photo?: string
  rating?: number
}

/* ─── Contact ───────────────────────────────────────────────── */

export interface ContactInfo {
  address: string
  phone: string
  mobile?: string
  whatsapp?: string
  email: string
  schedule: string
  mapsEmbedUrl: string
  social: SocialLinks
}

/* ─── Content Cards ─────────────────────────────────────────── */

export type ContentCardType = 'image' | 'video' | 'audio' | 'quote'

export interface ContentCard {
  id: string
  type: ContentCardType
  title: string
  excerpt?: string
  mediaSrc: string
  mediaPoster?: string
  category?: string
  author?: string
  date?: string
  href?: string
}
