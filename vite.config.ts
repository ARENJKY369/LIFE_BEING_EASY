import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Use relative base for GitHub Pages compatibility, but "/" also works with HashRouter
  // HashRouter ensures it works even without server rewrite.
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Fix: include only files that actually exist. Previous config referenced favicon.ico & mask-icon.svg which don't exist -> precache error -> stuck loading
      includeAssets: ['favicon.png', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'logo.png'],
      manifest: {
        name: 'LifePlanner OS',
        short_name: 'LifePlanner',
        description: 'Personal Operating System that eliminates decision fatigue - 100% offline',
        theme_color: '#0f1115',
        background_color: '#0f1115',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'browser'],
        scope: './',
        start_url: './',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        // Critical fix: SPA fallback for HashRouter and BrowserRouter
        navigateFallback: 'index.html',
        // Don't fallback for api or assets
        navigateFallbackAllowlist: [/^(?!\/__).*/],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Runtime caching to prevent network hang blocking app load
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
        // Skip waiting to avoid stuck on old SW version
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true
      },
      devOptions: {
        enabled: true, // Enable PWA in dev to test offline
        type: 'module'
      }
    })
  ],
  build: {
    // Ensure build doesn't fail on large chunks
    chunkSizeWarningLimit: 1000,
  },
  server: {
    host: true,
    port: 5173
  }
})
