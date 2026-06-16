import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ShopMatch Pro',
    short_name: 'ShopMatch',
    description: 'A test-mode SaaS job board demo built to prove full-stack product execution.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f6f3',
    theme_color: '#0f766e',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/brand/shopmatch-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/brand/shopmatch-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
