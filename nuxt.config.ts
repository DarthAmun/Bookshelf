export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: true },

  app: {
    baseURL: '/bookshelf/',
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Hanken+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap',
        },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  modules: ['@nuxtjs/tailwindcss', '@vite-pwa/nuxt'],

  runtimeConfig: {
    public: {
      googleBooksApiKey: '',
    },
  },

  pwa: {
    manifest: {
      name: 'Bookshelf',
      short_name: 'Bookshelf',
      description: 'Track and review your ebook library',
      theme_color: '#15120d',
      background_color: '#15120d',
      display: 'standalone',
      icons: [
        { src: '/bookshelf/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/bookshelf/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    workbox: {
      navigateFallback: '/bookshelf/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/www\.googleapis\.com\/books/,
          handler: 'CacheFirst' as const,
          options: {
            cacheName: 'google-books-cache',
            expiration: { maxAgeSeconds: 86400 },
          },
        },
        {
          urlPattern: /^https:\/\/covers\.openlibrary\.org/,
          handler: 'CacheFirst' as const,
          options: {
            cacheName: 'cover-images-cache',
            expiration: { maxAgeSeconds: 604800, maxEntries: 500 },
          },
        },
      ],
    },
    devOptions: {
      enabled: false,
    },
  },

  vite: {
    optimizeDeps: {
      include: ['dexie'],
    },
  },
})
