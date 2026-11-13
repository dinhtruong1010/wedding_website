import { list } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";
import { weddingContent } from "../config/wedding-content";

type VercelRequest = { method?: string };
type VercelResponse = {
  status: (code: number) => VercelResponse;
  setHeader: (name: string, value: string) => VercelResponse;
  json: (body: unknown) => void;
};

const isImage = (pathname: string) => /\.(avif|gif|jpe?g|png|webp)$/i.test(pathname);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method && req.method !== "GET") {
    return res.status(405).setHeader("Allow", "GET").json({ error: "Method not allowed" });
  }

  let config = { ...weddingContent };
  let blobLoaded = false;
  let neonLoaded = false;

  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) {
    try {
      const { blobs } = await list({ prefix: "wedding/" });
      const galleryImages = blobs.filter((blob) => isImage(blob.pathname) && blob.pathname.includes("/gallery/"));
      const audio = blobs.find((blob) => /\/audio\/.*\.(mp3|m4a|wav|ogg)$/i.test(blob.pathname));

      if (galleryImages.length > 0) config.galleryImages = galleryImages.map((blob) => blob.url);
      if (audio) config.audioUrl = audio.url;
      blobLoaded = galleryImages.length > 0 || Boolean(audio);
    } catch {
      // Local config remains the deploy-safe fallback when Blob is not provisioned yet.
    }
  }

  if (process.env.DATABASE_URL) {
    try {
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

  return res
    .status(200)
    .setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300")
    .json({ config, source: { blob: blobLoaded, neon: neonLoaded } });
}
