/// <reference types="vitest" />
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  /** Toutes les variables VITE_* sont lues depuis `environments/` (voir `environments/README.md`). */
  envDir: path.resolve(__dirname, 'environments'),
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@domain': path.resolve(__dirname, 'src/domain'),
      '@application': path.resolve(__dirname, 'src/application'),
      '@infrastructure': path.resolve(__dirname, 'src/infrastructure'),
      '@presentation': path.resolve(__dirname, 'src/presentation'),
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    css: false,
  },
});
