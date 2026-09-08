import type { CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

const BASE_URL = (import.meta.env.PUBLIC_BASE_PATH || import.meta.env.BASE_URL).replace(/\/$/, '');
export const sitePath = (path: string) => `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}` || '/';

const DEPLOYMENT_HIDDEN_POSTS = new Set([
  'projects/road-property-vision-model'
]);

export const isVisiblePost = (post: Post) =>
  !post.data.draft &&
  !(import.meta.env.PUBLIC_DEPLOYMENT === 'true' && DEPLOYMENT_HIDDEN_POSTS.has(post.id));

export const byNewest = (a: Post, b: Post) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf();
export const visiblePosts = (posts: Post[]) => posts.filter(isVisiblePost).sort(byNewest);
export const formatDate = (date: Date) => new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit'
}).format(date);
export const postHref = (post: Post) => sitePath(`/articles/${post.id}/`);
