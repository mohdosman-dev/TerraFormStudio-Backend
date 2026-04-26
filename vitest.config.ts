import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
})
