import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    coverage: {
      reporter: ['lcov', 'html'],
      provider: 'v8',
    },
  },

  resolve: {
    alias: {
      '@frontend': resolve(__dirname, './src'),
      '@api': resolve(__dirname, '../api/src'),
      '@workspace/ui': resolve(__dirname, '../../packages/ui/src'),
    },
  },
})
