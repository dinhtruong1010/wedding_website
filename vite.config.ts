import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';


export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');

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
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
