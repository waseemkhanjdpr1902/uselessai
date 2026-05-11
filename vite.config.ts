import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Don't fail build on TypeScript errors
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress all warnings during build
        if (warning.code === 'MODULE_NOT_FOUND') return
        warn(warning)
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'clsx',
      'tailwind-merge',
      'zustand',
      'nanoid',
      'date-fns',
      'recharts',
      'pdf-lib',
      'pdfjs-dist',
      '@google/generative-ai',
    ],
  },
})
