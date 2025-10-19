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
})
