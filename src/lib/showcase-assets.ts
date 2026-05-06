/* Assets para la página /componentes (showcase local — solo desarrollo) */

export const SHOWCASE_IMAGES = {
  portfolio: Array.from({ length: 20 }, (_, i) => `/images/portfolio/Foto-${i + 1}.webp`),
  brand: [
    '/images/banner/banner-1-ia-no-redes.png',
    '/images/banner/banner-2-empaques.png',
    '/images/banner/banner-3-impresiones.png',
  ],
  parallax: ['/images/banner/banner-4-material-pop.png', '/images/banner/vertical_banner.png'],
  hero: '/images/banner/vertical_banner.png',
}

export const SHOWCASE_VIDEOS = {
  hero: '/videos/machine/maquina_1_min.mp4',
  process: '/videos/machine/maquina_2_min.mp4',
}
