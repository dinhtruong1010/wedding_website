# Wedding Website v1

V1 is a Vite frontend with a Vercel Function at `/api/wedding-content`.

Set the Vercel project root to `apps/v1`. Add `BLOB_READ_WRITE_TOKEN` and `DATABASE_URL` in the Vercel environment settings. The function reads files under `wedding/gallery/` and `wedding/audio/` from Vercel Blob, then overlays the `v1/wedding` JSON row from Neon when it exists. The local config remains a safe fallback for previews and first deploys.

Run `api/schema.sql` once against the Neon database before inserting dynamic wedding content.
