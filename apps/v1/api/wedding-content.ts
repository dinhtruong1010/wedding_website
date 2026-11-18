export const config = { runtime: "nodejs" };

type VercelRequest = {
  method?: string;
  url?: string;
  query?: Record<string, string | string[] | undefined>;
};

// "/na" (Nghệ An) shares the Neon database but uses its own tables (*_na),
// so RSVPs and wishes of the two invitations never mix.
const resolveSite = (req: VercelRequest) => {
  const raw = req.query?.site ?? new URL(req.url ?? "/", "http://localhost").searchParams.get("site");
  return (Array.isArray(raw) ? raw[0] : raw) === "na" ? "na" : "hn";
};
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
type WeddingMediaConfig = {
  galleryImages?: string[];
  audioUrl?: string;
  heroImages?: {
    mobile?: ResponsiveImageSource;
    tablet?: ResponsiveImageSource;
    desktop?: ResponsiveImageSource;
  };
  storyImage?: string;
  storyImages?: string[];
};
type ResponsiveImageSource = { avif?: string; webp?: string; fallback: string };

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
    let config: WeddingMediaConfig = {};
    let blobLoaded = false;
    let neonLoaded = false;
    let galleryCount = 0;

    // Neon owns editable text/configuration. Media is resolved from Blob below,
    // so stale gallery/audio values in the database cannot override Blob files.
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      try {
        const { neon } = await import("@neondatabase/serverless");
        const sql = neon(databaseUrl);
        const rows = await sql`SELECT value FROM wedding_config WHERE version = ${resolveSite(req) === "na" ? "na" : "v1"} AND key = 'wedding' LIMIT 1`;
        const stored = rows[0]?.value as WeddingMediaConfig | undefined;
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
        const heroPrefix = process.env.BLOB_HERO_PREFIX ?? "wedding/hero/";
        const storyPrefix = process.env.BLOB_STORY_PREFIX ?? "wedding/story/";
        const canonicalGallery = blobs.filter((blob) => isImage(blob.pathname) && blob.pathname.startsWith(galleryPrefix));
        const galleryImages = canonicalGallery.length > 0
          ? canonicalGallery
          : blobs.filter((blob) => isImage(blob.pathname) && !blob.pathname.includes("/audio/") && !blob.pathname.includes("/object/"));
        const audioFiles = blobs.filter((blob) => isAudio(blob.pathname) && blob.pathname.startsWith(audioPrefix));
        const audio = audioFiles.find((blob) => /\/Audio\.m4a$/i.test(blob.pathname))
          ?? audioFiles.find((blob) => /\/Audio\.mp3$/i.test(blob.pathname))
          ?? audioFiles.find((blob) => /\.(m4a|mp3)$/i.test(blob.pathname))
          ?? audioFiles[0]
          ?? blobs.find((blob) => isAudio(blob.pathname) && blob.pathname.includes("/audio/"));
        const heroFiles = blobs.filter((blob) => isImage(blob.pathname) && blob.pathname.startsWith(heroPrefix));
        const storyFiles = blobs
          .filter((blob) => isImage(blob.pathname) && blob.pathname.startsWith(storyPrefix))
          .sort((left, right) => left.pathname.localeCompare(right.pathname));
        const story = storyFiles[0];

        if (galleryImages.length > 0) config.galleryImages = galleryImages.map((blob) => blob.url);
        if (audio) config.audioUrl = audio.url;
        if (heroFiles.length > 0) {
          const byName = (name: string): ResponsiveImageSource | undefined => {
            const stem = name.replace(/\.[^.]+$/, "");
            const find = (extension: string) => heroFiles.find((blob) => blob.pathname.toLowerCase().endsWith(`/${stem}.${extension}`))?.url;
            const avif = find("avif");
            const webp = find("webp");
            const fallback = find("png") ?? find("jpg") ?? find("jpeg");
            return fallback ? { avif, webp, fallback } : undefined;
          };
          config.heroImages = {
            mobile: byName("hero-mobile") ?? config.heroImages?.mobile,
            tablet: byName("hero-tablet") ?? config.heroImages?.tablet,
            desktop: byName("hero-desktop") ?? config.heroImages?.desktop,
          };
        }
        if (story) config.storyImage = story.url;
        if (storyFiles.length > 0) {
          const storyByNumber = new Map(
            storyFiles
              .map((file) => file.pathname.match(/story_(\d+)\.[^.]+$/i)?.[1] && [Number(file.pathname.match(/story_(\d+)\.[^.]+$/i)?.[1]), file.url])
              .filter((entry): entry is [number, string] => Boolean(entry)),
          );
          const firstStory = storyFiles[0].url;
          config.storyImages = Array.from({ length: 8 }, (_, index) => (
            storyByNumber.get(index + 1) ?? storyByNumber.get(index) ?? storyByNumber.get(index + 2) ?? firstStory
          ));
        }
        galleryCount = galleryImages.length;
        blobLoaded = galleryImages.length > 0 || Boolean(audio) || heroFiles.length > 0 || Boolean(story);
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
