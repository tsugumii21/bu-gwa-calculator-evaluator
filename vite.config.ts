import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  base: './',
  root: 'src',
  publicDir: '../public',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'zustand'],
          'lottie-vendor': ['lottie-react'],
          'pdf-vendor': ['pdfjs-dist'],
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
});
