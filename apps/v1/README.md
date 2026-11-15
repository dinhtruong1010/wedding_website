# Wedding Website v1

V1 is a Vite frontend with a Vercel Function at `/api/wedding-content`.

Set the Vercel project root to `apps/v1`. Add `BLOB_READ_WRITE_TOKEN` or the managed `BLOB_STORE_ID`, plus `DATABASE_URL`, in the Vercel environment settings. Vercel OIDC is enabled for the project so `@vercel/blob` can use the managed store from the function without exposing a token to the browser. The function reads every file under `wedding/gallery/` and `wedding/audio/` from Vercel Blob, then overlays optional media values from the `v1/wedding` JSON row in Neon. The frontend-owned JSON config remains a safe fallback for previews and first deploys.

Use this naming convention for predictable updates:

- `wedding/gallery/001.jpg`, `wedding/gallery/002.webp`, ... for album images.
- `wedding/audio/ceremony.mp3` for background audio.
- `wedding/hero/hero-mobile.jpg`, `wedding/hero/hero-tablet.jpg`, `wedding/hero/hero-desktop.jpg` for responsive hero images.
- `wedding/story/story.jpg` (any image filename is accepted) for the story image.
- `wedding/object/...` for future downloadable files that should not appear in the album.

`BLOB_GALLERY_PREFIX`, `BLOB_AUDIO_PREFIX`, `BLOB_HERO_PREFIX`, and `BLOB_STORY_PREFIX` can be changed per Vercel environment for testing another folder. The API lists all Blob pages, so adding or removing files updates the album without a frontend redeploy. The API response is intentionally `no-store` during testing so a refresh reads the current Blob contents.

Run `api/schema.sql` once against the Neon database before inserting dynamic wedding content.

## RSVP data

RSVP responses are stored in `wedding_rsvps`. The public API only accepts `POST /api/rsvps`; do not expose a public listing endpoint because guest attendance is private. Each browser keeps a submission ID, so resubmitting updates the same response instead of creating a duplicate.

Use Neon SQL for organizer-only exports and counts:

```sql
select
  guest_name,
  case when attending then 'attending' else 'not_attending' end as attendance,
  party_size,
  created_at,
  updated_at
from wedding_rsvps
order by created_at desc;

select
  count(*) filter (where attending) as attending_response_count,
  coalesce(sum(party_size) filter (where attending), 0) as attending_guest_count,
  count(*) filter (where not attending) as not_attending_count
from wedding_rsvps;
```

For a public wedding site, keep the form to the minimum information needed, validate every request server-side, and add a Vercel Firewall rate-limit rule for `POST /api/rsvps` before opening the invitation broadly.
