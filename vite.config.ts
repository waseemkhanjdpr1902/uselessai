import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 3000,
  },
  define: {
    'process.env.OPENAI_API_KEY': JSON.stringify(''),
    'process.env.GROQ_API_KEY': JSON.stringify(''),
  }
})
