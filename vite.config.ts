import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { localGabay } from './server/gabay';

export default defineConfig(({ mode }) => ({
  base: './',
  root: 'src',
  publicDir: '../public',
  plugins: [react(), tailwindcss(), localGabay(loadEnv(mode, __dirname, 'GEMINI_').GEMINI_API_KEY?.trim())],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'zustand'],
          'lottie-vendor': ['lottie-react'],
          'pdf-vendor': ['pdfjs-dist/legacy/build/pdf.mjs'],
          'ocr-vendor': ['tesseract.js'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
}));
