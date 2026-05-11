import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@ai-sdk/openai': path.resolve(__dirname, 'src/lib/ai.ts'),
      '@ai-sdk/anthropic': path.resolve(__dirname, 'src/lib/ai.ts'),
      '@ai-sdk/groq': path.resolve(__dirname, 'src/lib/ai.ts'),
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 4000,
  },
})
