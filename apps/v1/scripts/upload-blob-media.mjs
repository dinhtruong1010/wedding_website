// Upload production media to Vercel Blob at stable (non-random) paths.
// Usage (from repo root):
//   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_... node apps/v1/scripts/upload-blob-media.mjs
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { put } from '@vercel/blob';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const files = [
  { local: 'public/audio/Audio.m4a', pathname: 'wedding/audio/Audio.m4a', contentType: 'audio/mp4' },
  { local: 'public/data/story_images/story_5.jpg', pathname: 'wedding/story/story_5.jpg', contentType: 'image/jpeg' },
  { local: 'public/data/story_images/story_7.jpg', pathname: 'wedding/story/story_7.jpg', contentType: 'image/jpeg' },
];

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('Missing BLOB_READ_WRITE_TOKEN');
  process.exit(1);
}

for (const file of files) {
  const body = await readFile(path.join(root, file.local));
  const blob = await put(file.pathname, body, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: file.contentType,
    cacheControlMaxAge: 60 * 60 * 24 * 30,
  });
  console.log(`${file.local} -> ${blob.url}`);
}
