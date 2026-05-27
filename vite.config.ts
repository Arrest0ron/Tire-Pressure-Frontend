// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import { VitePWA } from 'vite-plugin-pwa'

// ✅ Импортируем конфиги
import { GITHUB_PAGES_REPO_SLUG } from './src/config/githubPages'
import { ZEROTIER_PC_HOST, API_ORIGIN_PC } from './src/config/backendHost'

// 🔹 Вычисляем base: в проде — с подпапкой репо, в деве — корень
const isProdBuild = process.env.NODE_ENV === 'production'
const base = !isProdBuild ? '/' : `/${GITHUB_PAGES_REPO_SLUG}/`

export default defineConfig({
  base,
  plugins: [
    react(),
    // ✅ mkcert с явным списком хостов (включая ZeroTier IP)
    mkcert({
      hosts: ['localhost', '127.0.0.1', ZEROTIER_PC_HOST],
    }),
    // ✅ PWA (требование ЛР)
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192.png', 'pwa-512.png', 'vite.svg'],
      manifest: {
        name: 'Tire Pressure Calculator',
        short_name: 'TireCalc',
        description: 'Калькулятор давления в шинах и каталог услуг',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#f6f7f7',
        theme_color: '#0d6efd',
        orientation: 'any',
        lang: 'ru',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,mp4,webm,wasm}'],
        maximumFileSizeToCacheInBytes: 35 * 1024 * 1024,
      },
      devOptions: { enabled: true },
    }),
  ],
  server: {
    host: true,        // ✅ Слушает все интерфейсы (включая ZeroTier)
    port: 3000,
    strictPort: true,
    // ✅ Прокси: /api → бэкенд по ZeroTier IP
    proxy: {
      '/api': {
        target: API_ORIGIN_PC,  // ← http://10.147.20.84:8080
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // ✅ Прокси для preview-режима (тест продакшен-сборки локально)
  preview: {
    host: true,
    port: 4173,
    proxy: {
      '/api': {
        target: API_ORIGIN_PC,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})