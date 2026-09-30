import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/v2/',
  root: path.resolve(__dirname, 'v2'),
  publicDir: path.resolve(__dirname, 'public'),
  plugins: [react(), tailwindcss()],
  build: {
    outDir: path.resolve(__dirname, 'dist-v2'),
    emptyOutDir: true,
  },
  server: {
    port: 3001,
    host: '0.0.0.0',
  },
});
