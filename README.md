# Đình Trường & Thanh Ngà Wedding Website

A bilingual Vietnamese/English wedding website built with React, Vite, TypeScript, Tailwind CSS, Motion, and Lucide icons.

## Run Locally

Prerequisite: Node.js

```bash
npm install
npm run dev:v1
```

V1 runs at `http://localhost:3000`. V2 and V3 are separate workspace applications:

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
apps/
  v1/
    src/                          V1 page, content, i18n, and styles
    public/                       V1 images and audio
    vite.config.ts                V1 build boundary
    package.json
  v2/
    src/                          V2 page, content, and styles
    public/                       V2 images and audio
    vite.config.ts                V2 build boundary
    package.json
  v3/
    src/                          V3 page, content, and styles
    public/                       V3 images and audio
    vite.config.ts                V3 build boundary
    package.json
```

## Update Content

Edit [apps/v1/src/config.ts](apps/v1/src/config.ts) for V1 names, wedding date, venue, address, map URL, QR codes, and gallery images.

Edit [apps/v1/src/i18n.ts](apps/v1/src/i18n.ts) for V1 Vietnamese and English page copy.

Edit [apps/v2/src/config.ts](apps/v2/src/config.ts) or [apps/v3/src/config.ts](apps/v3/src/config.ts) for the corresponding version's editable wedding information:

- Couple names and monogram
- Wedding date and time (`event.date` uses ISO format with timezone)
- Guest arrival time (V3)
- Venue, address, Google Maps URL, and optional map embed URL
- Family information
- Photos, gallery, audio, and gift QR URLs

Edit `apps/v2/src/content.ts` or `apps/v3/src/content.ts` only when changing page copy or translations. Add images and audio to that version's `public/` directory.

## Useful Commands

```bash
npm run dev:v1    # V1 on port 3000
npm run dev:v2    # V2 on port 3001
npm run dev:v3    # V3 on port 3002
npm run build:v1  # build apps/v1/dist/
npm run build:v2  # build apps/v2/dist/
npm run build:v3  # build apps/v3/dist/
npm run build:all # build all versions
```

## Deploy

Create one Vercel Project per version, all connected to this repository:

| Project | Root Directory | Build Command | Output Directory |
| --- | --- | --- | --- |
| V1 | `apps/v1` | `npm run build` | `dist` |
| V2 | `apps/v2` | `npm run build` | `dist` |
| V3 | `apps/v3` | `npm run build` | `dist` |

Each project now has its own Vite root and publishes its local `dist/`. No root `vercel.json` is required, so one version cannot accidentally publish another version's output.
