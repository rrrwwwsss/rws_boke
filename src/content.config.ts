import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    category: z.enum(['技术教程', '项目实战', '原理解析', '工程实践', '踩坑复盘', 'AI 工具']),
    series: z.string().optional(),
    tags: z.array(z.string()).default([]),
    cover: image().optional(),
    repository: z.object({
      url: z.url(),
      label: z.string().optional()
    }).optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    readingTime: z.string().optional()
  })
});

export const collections = { posts };
