import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/v3/',
  root: path.resolve(__dirname, 'v3'),
  publicDir: path.resolve(__dirname, 'public'),
  plugins: [react(), tailwindcss()],
  build: {
    outDir: path.resolve(__dirname, 'dist-v3'),
    emptyOutDir: true,
  },
  server: {
    port: 3002,
    host: '0.0.0.0',
  },
});
