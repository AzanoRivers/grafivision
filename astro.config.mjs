// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import vercel from '@astrojs/vercel'

export default defineConfig({
  output: 'server',
  site: 'https://grafivision.com.co',
  trailingSlash: 'never',
  compressHTML: true,

  integrations: [react()],

  image: {
    domains: ['imagedelivery.net'],
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'development'),
    },
  },

  adapter: vercel({
    // Cache SSR pages at the edge for 1 hour; revalidate on next request after expiry
    isr: {
      expiration: 60 * 60,
    },
    // Vercel Web Analytics (enable in Vercel dashboard too)
    webAnalytics: { enabled: true },
  }),
})
