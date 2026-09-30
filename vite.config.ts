import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';


export default defineConfig(({mode}) => {
  // Determine base path based on deployment platform
  let base = '/';
  if (mode === 'production') {
    if (process.env.VERCEL_URL) {
      // Vercel deployment - use root path
      base = '/';
    } else {
      // GitHub Pages deployment
      base = '/wedding_website/';
    }
  }

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
