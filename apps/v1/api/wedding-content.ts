type VercelRequest = { method?: string };
type VercelResponse = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
};

const sendJson = (res: VercelResponse, statusCode: number, body: unknown) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
};

const isImage = (pathname: string) => /\.(avif|gif|jpe?g|png|webp)$/i.test(pathname);
const isAudio = (pathname: string) => /\.(mp3|m4a|wav|ogg)$/i.test(pathname);

async function listAllBlobs() {
  const { list } = await import("@vercel/blob");
  const blobs: Array<{ pathname: string; url: string }> = [];
  let cursor: string | undefined;

  do {
    const page = await list({ cursor, limit: 100 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return blobs;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method && req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  try {
    const { weddingContent } = await import("../config/wedding-content");
    let config = { ...weddingContent };
    let blobLoaded = false;
    let neonLoaded = false;
    let galleryCount = 0;

    // Neon owns editable text/configuration. Media is resolved from Blob below,
    // so stale gallery/audio values in the database cannot override Blob files.
    if (process.env.DATABASE_URL) {
      try {
        const { neon } = await import("@neondatabase/serverless");
        const sql = neon(process.env.DATABASE_URL);
        const rows = await sql`SELECT value FROM wedding_config WHERE version = 'v1' AND key = 'wedding' LIMIT 1`;
        const stored = rows[0]?.value as Partial<typeof weddingContent> | undefined;
        if (stored) {
          config = { ...config, ...stored };
          neonLoaded = true;
        }
      } catch {
        // The schema is optional during first deploy; preserve the file-based config.
      }
    }

    if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) {
      try {
        const blobs = await listAllBlobs();
        const galleryPrefix = process.env.BLOB_GALLERY_PREFIX ?? "wedding/gallery/";
        const audioPrefix = process.env.BLOB_AUDIO_PREFIX ?? "wedding/audio/";
        const canonicalGallery = blobs.filter((blob) => isImage(blob.pathname) && blob.pathname.startsWith(galleryPrefix));
        const galleryImages = canonicalGallery.length > 0
          ? canonicalGallery
          : blobs.filter((blob) => isImage(blob.pathname) && !blob.pathname.includes("/audio/") && !blob.pathname.includes("/object/"));
        const audio = blobs.find((blob) => isAudio(blob.pathname) && blob.pathname.startsWith(audioPrefix))
          ?? blobs.find((blob) => isAudio(blob.pathname) && blob.pathname.includes("/audio/"));

        if (galleryImages.length > 0) config.galleryImages = galleryImages.map((blob) => blob.url);
        if (audio) config.audioUrl = audio.url;
        galleryCount = galleryImages.length;
        blobLoaded = galleryImages.length > 0 || Boolean(audio);
      } catch {
        // Local config remains the deploy-safe fallback when Blob is not provisioned yet.
      }
    }

    res.setHeader("Cache-Control", "no-store, max-age=0");
    return sendJson(res, 200, { config, source: { blob: blobLoaded, neon: neonLoaded, galleryCount } });
  } catch {
    return sendJson(res, 200, { config: {}, source: { blob: false, neon: false, galleryCount: 0 } });
  }
}
