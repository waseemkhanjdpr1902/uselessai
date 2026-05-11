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
    rollupOptions: {
      onwarn(warning, warn) {
        if (
          warning.code === 'MODULE_NOT_FOUND' ||
          warning.code === 'UNRESOLVED_IMPORT' ||
          (warning.message && warning.message.includes('motion/react'))
        ) return
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
      'motion',
    ],
  },
})
