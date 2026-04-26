import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    include: ['test/**/*.test.ts'],
    exclude: ['dist/**', 'node_modules/**']
  }
})
