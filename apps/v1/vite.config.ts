import fs from 'node:fs';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';

/** Production URL used for absolute link-preview URLs (override with VITE_SITE_URL). */
const DEFAULT_SITE_URL = 'https://weddingwebsite-beannnalee.vercel.app';

/** Text that differs on the Nghệ An page (/na). Keep in sync with src/site.ts. */
const NA_META: Array<[string, string]> = [
  ['<title>Đình Trường & Thanh Ngà · Thiệp cưới 12.12.2026</title>', '<title>Đình Trường & Thanh Ngà · Thiệp cưới 29.11.2026</title>'],
  [
    'Trân trọng kính mời bạn đến chung vui trong lễ cưới của Đình Trường & Thanh Ngà · 12.12.2026 · Aquaria Palace, Hà Nội.',
    'Trân trọng kính mời bạn đến chung vui trong lễ cưới của Đình Trường & Thanh Ngà · 29.11.2026 · Nghệ An.',
  ],
  ['Trân trọng kính mời bạn đến chung vui · 12.12.2026 · Aquaria Palace, Hà Nội', 'Trân trọng kính mời bạn đến chung vui · 29.11.2026 · Nghệ An'],
];

/**
 * Link-preview crawlers (Zalo, Facebook) don't run JavaScript, so meta tags must be
 * final in the HTML: fill in absolute URLs, and emit a separate na.html for /na.
 */
const shareMeta = (siteUrl: string, blobOrigin: string): Plugin => ({
  name: 'share-meta',
  transformIndexHtml: (html) => {
    let out = html.replaceAll('__SITE_URL__', siteUrl);
    out = blobOrigin
      ? out.replaceAll('__BLOB_ORIGIN__', blobOrigin)
      : out.replace(/^.*__BLOB_ORIGIN__.*\n/m, '');
    return out;
  },
  writeBundle: (options) => {
    const dir = options.dir ?? 'dist';
    let html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
    for (const [from, to] of NA_META) {
      if (!html.includes(from)) throw new Error(`share-meta: "${from}" not found in index.html`);
      html = html.replaceAll(from, to);
    }
    html = html.replace(`content="${siteUrl}/"`, `content="${siteUrl}/na"`);
    fs.writeFileSync(path.join(dir, 'na.html'), html);
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = (env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
  const blobBase = env.VITE_BLOB_PUBLIC_BASE_URL || '';
  const blobOrigin = blobBase ? new URL(blobBase).origin : '';

  return {
    base: '/',
    plugins: [react(), tailwindcss(), shareMeta(siteUrl, blobOrigin)],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
  };
});
