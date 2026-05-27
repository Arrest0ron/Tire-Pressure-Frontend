// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// ✅ Импортируем ТОЛЬКО то, что реально используется:
import { API_PORT } from './src/config/backendHost'

// Функция для определения хоста прокси
function resolveProxyHostSync(env: Record<string, string>): string {
  const fromEnv = env.VITE_PROXY_BACKEND_HOST?.trim()
  if (fromEnv) return fromEnv
  return '127.0.0.1'
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  // Base: для Tauri/build — './', для dev — '/'
  const base =  '/'
  
  // Хост для прокси в dev-режиме
  const proxyHost = resolveProxyHostSync(env)
  const backendApiOrigin = `http://${proxyHost}:${API_PORT}`

  return {
    base,
    envPrefix: ['VITE_', 'TAURI_'],
    clearScreen: false,
    
    plugins: [
      react(),
      // ✅ mkcert полностью удалён — чистый HTTP для Tauri
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
        devOptions: { enabled: mode === 'development' },
      }),
    ],
    
    server: {
      host: true,
      port: 3000,
      strictPort: true,
      proxy: {
        '/api': {
          target: backendApiOrigin,
          changeOrigin: true,
          secure: false,
        },
      },
      watch: {
        ignored: ['**/src-tauri/**'],
      },
    },
    
    preview: {
      host: true,
      port: 4173,
      proxy: {
        '/api': {
          target: backendApiOrigin,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})