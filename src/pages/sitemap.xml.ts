export const prerender = true

import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { portfolioItems } from '@/lib/data/portfolio'

const SITE = 'https://grafivision.com.co'
const TODAY = new Date().toISOString().split('T')[0]

interface SitemapEntry {
  url: string
  priority: string
  changefreq: string
  lastmod?: string
}

const staticPages: SitemapEntry[] = [
  { url: '/',           priority: '1.0', changefreq: 'weekly' },
  { url: '/nosotros',   priority: '0.8', changefreq: 'monthly' },
  { url: '/portafolio', priority: '0.9', changefreq: 'weekly' },
  { url: '/equipo',     priority: '0.7', changefreq: 'monthly' },
  { url: '/blog',       priority: '0.8', changefreq: 'weekly' },
  { url: '/contacto',   priority: '0.8', changefreq: 'monthly' },
]

const portfolioPages: SitemapEntry[] = portfolioItems.map((item) => ({
  url: `/portafolio/${item.slug}`,
  priority: item.featured ? '0.8' : '0.6',
  changefreq: 'monthly',
}))

function buildXml(entries: SitemapEntry[]): string {
  const urls = entries.map(
    (p) => `  <url>
    <loc>${SITE}${p.url}</loc>
    <lastmod>${p.lastmod ?? TODAY}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  ).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls}
</urlset>`
}

export const GET: APIRoute = async () => {
  const blogPosts = await getCollection('blog')
  const blogPages: SitemapEntry[] = blogPosts.map((post) => ({
    url: `/blog/${post.id}`,
    priority: post.data.featured ? '0.8' : '0.6',
    changefreq: 'monthly',
    lastmod: post.data.updatedDate?.toISOString().split('T')[0]
      ?? post.data.pubDate.toISOString().split('T')[0],
  }))

  const allPages = [...staticPages, ...portfolioPages, ...blogPages]

  return new Response(buildXml(allPages), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
