/* Assets para la página /componentes (showcase local — solo desarrollo) */

export const SHOWCASE_IMAGES = {
  portfolio: Array.from({ length: 20 }, (_, i) => `/images/portfolio/Foto-${i + 1}.webp`),
  brand: [
    '/images/banner/banner_1.png',
    '/images/banner/banner_2.png',
    '/images/banner/banner_3.png',
  ],
  parallax: ['/images/banner/banner_4.png', '/images/banner/vertical_banner.png'],
  hero: '/images/banner/vertical_banner.png',
}

export const SHOWCASE_VIDEOS = {
  hero: '/videos/machine/maquina_1_min.mp4',
  process: '/videos/machine/maquina_2_min.mp4',
}
