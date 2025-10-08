import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { qrcode } from 'vite-plugin-qrcode'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
    qrcode({
      filter: (url) => url.includes('192.'),
    }),
  ],
  test: {
    environment: 'happy-dom',
    globals: true,
    coverage: {
      reporter: ['lcov', 'html'],
      provider: 'v8',
    },
  },
  server: {
    host: true,
    proxy: {
      '/api': {
        target: `http://localhost:8000`,
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ['better-auth'],
  },
  resolve: {
    alias: {
      '@frontend': resolve(__dirname, './src'),
      '@': resolve(__dirname, './src'),
      '@workspace/ui': resolve(__dirname, '../../packages/ui/src'),
    },
  },
})
