// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import vercel from '@astrojs/vercel'

/** @type {import('vite').Plugin} */
const reactNodeEnv = {
  name: 'react-node-env',
  config(_, { mode }) {
    return {
      define: {
        'process.env.NODE_ENV': JSON.stringify(mode),
      },
    }
  },
}

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
    plugins: [tailwindcss(), reactNodeEnv],
    resolve: {
      dedupe: ['react', 'react-dom'],
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
