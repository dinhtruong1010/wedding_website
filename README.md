# Đình Trường & Thanh Ngà Wedding Website

A bilingual Vietnamese/English wedding website built with React, Vite, TypeScript, Tailwind CSS, Motion, and Lucide icons.

## Run Locally

Prerequisite: Node.js

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:3000`.

V2 is a separate application and runs on its own port:

```bash
npm run dev:v2
```

The V2 dev server runs at `http://localhost:3001`.

V3 is a separate application inspired by a traditional green-and-gold Vietnamese wedding invitation:

```bash
npm run dev:v3
```

The V3 dev server runs at `http://localhost:3002`.

## Project Structure

```text
src/
  App.tsx                         Page sections and layout
  config.ts                       Wedding info, QR codes, and image paths
  i18n.ts                         Vietnamese and English copy
  components/ResponsiveImage.tsx  Reusable responsive image components
  index.css                       Theme tokens and global styles

public/data/                      Wedding photos and generated hero images

v2/
  src/content.ts                  V2 wedding content and copy
  src/App.tsx                     V2 invitation experience
  src/styles.css                  V2-only visual system
vite.v2.config.ts                 V2 build boundary

v3/
  src/content.ts                  V3 wedding content and copy
  src/App.tsx                     V3 traditional invitation experience
  src/styles.css                  V3-only visual system
vite.v3.config.ts                 V3 build boundary
```

## Update Content

Edit [src/config.ts](src/config.ts) for names, wedding date, venue, address, map URL, QR codes, and gallery images.

Edit [src/i18n.ts](src/i18n.ts) for Vietnamese and English page copy.

Add images to `public/data/`, then reference them from `src/config.ts`.

## Useful Commands

```bash
npm run dev      # start local development
npm run lint     # type-check the project
npm run build    # create production build
npm run build:v2 # create V2 build in dist-v2/
npm run build:v3 # create V3 build in dist-v3/ with /v3/ base path
npm run build:v3:standalone # create V3 build for a separate domain
npm run build:all # build V1, V2, and V3 separately
npm run preview  # preview production build
npm run clean    # remove dist/
```

## Deploy

The project includes `vercel.json` for Vercel deployment. The Vite config also supports GitHub Pages by using `/wedding_website/` as the production base when not deployed on Vercel.

## V1 and V2 Deployment

V1 remains the root application and builds to `dist/`. V2 is isolated in `v2/` and builds to `dist-v2/` with a `/v2/` base path.

For local development, run them independently:

```bash
npm run dev       # V1 on port 3000
npm run dev:v2    # V2 on port 3001
```

For deployment on one domain, V3 uses `npm run build:v3` and the `/v3/` base path. For a separate Vercel domain, use `npm run build:v3:standalone` with output `dist-v3`. This keeps releases and rollbacks independent.
