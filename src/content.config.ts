import { defineCollection } from 'astro:content'
import { z } from 'zod'
import { glob } from 'astro/loaders'

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    pubDate:     z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author:      z.string().default('GrafiVisión'),
    thumbnail:   z.string(),
    category:    z.enum(['diseno', 'branding', 'tendencias', 'tips']),
    tags:        z.array(z.string()).default([]),
    featured:    z.boolean().default(false),
  }),
})

export const collections = { blog }
