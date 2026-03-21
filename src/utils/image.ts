/**
 * Routes an image URL through Netlify Image CDN.
 * - Converts to WebP automatically
 * - Serves from Netlify's global edge network (eliminates ImgBB latency)
 * - Falls back to the original URL in local development
 */
const IS_DEV = import.meta.env.DEV;

export function img(url: string, width?: number, quality = 80): string {
  if (IS_DEV || !url) return url;
  const params = new URLSearchParams({ url, q: String(quality), fm: 'webp' });
  if (width) params.set('w', String(width));
  return `/.netlify/images?${params}`;
}
