# Wedding Website v1

V1 is a Vite frontend with a Vercel Function at `/api/wedding-content`.

Set the Vercel project root to `apps/v1`. Add `BLOB_READ_WRITE_TOKEN` or the managed `BLOB_STORE_ID`, plus `DATABASE_URL`, in the Vercel environment settings. The function reads every file under `wedding/gallery/` and `wedding/audio/` from Vercel Blob, then overlays the `v1/wedding` JSON row from Neon for editable text/configuration. Blob always wins for gallery and audio media. The local config remains a safe fallback for previews and first deploys.

Use this naming convention for predictable updates:

- `wedding/gallery/001.jpg`, `wedding/gallery/002.webp`, ... for album images.
- `wedding/audio/ceremony.mp3` for background audio.
- `wedding/object/...` for future downloadable files that should not appear in the album.

`BLOB_GALLERY_PREFIX` and `BLOB_AUDIO_PREFIX` can be changed per Vercel environment for testing another folder. The API lists all Blob pages, so adding or removing files updates the album without a frontend redeploy. The API response is intentionally `no-store` during testing so a refresh reads the current Blob contents.

Run `api/schema.sql` once against the Neon database before inserting dynamic wedding content.
