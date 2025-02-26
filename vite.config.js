import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@assets': resolve(__dirname, 'assets')
    }
  },
  server: {
    host: true
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']
        }
      }
    }
  }
}); 