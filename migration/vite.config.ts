import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  base: './',
  server: { watch: { ignored: ['**/public/assets/**'] } },
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        prolog: resolve(import.meta.dirname, 'index.html'),
        act1: resolve(import.meta.dirname, 'act1.html'),
      },
      output: {
        manualChunks: (id) => (id.includes('/node_modules/phaser/') ? 'phaser' : undefined),
      },
    },
  },
});
