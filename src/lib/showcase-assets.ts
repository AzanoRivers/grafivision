/* Assets para la página /componentes (showcase local — solo desarrollo) */

export const SHOWCASE_IMAGES = {
  portfolio: Array.from({ length: 20 }, (_, i) => `/images/portfolio/Foto-${i + 1}.webp`),
  brand: [
    '/images/brand/GF-1.webp',
    '/images/brand/GF-2.webp',
    '/images/brand/GF-4.webp',
  ],
  parallax: ['/images/brand/GF-5.webp', '/images/brand/GF-6.webp'],
  hero:     '/images/brand/GF-1.webp',
}

export const SHOWCASE_VIDEOS = {
  hero:    '/videos/machine/maquina_1_min.mp4',
  process: '/videos/machine/maquina_2_min.mp4',
}
