export const config = { runtime: "nodejs" };

type VercelRequest = {
  method?: string;
  body?: unknown;
  url?: string;
  query?: Record<string, string | string[] | undefined>;
};

// Wishes are shared by both invitations (/ and /na): one wall, one table.
const WISHES_TABLE = "wedding_wishes";

type VercelResponse = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
};

type WishRow = {
  id: string;
  name: string;
  message: string;
  created_at: string;
};

const sendJson = (res: VercelResponse, statusCode: number, body: unknown) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
};

const toWish = (row: WishRow) => ({
  id: row.id,
  name: row.name,
  message: row.message,
  createdAt: row.created_at,
});

/** Removes control and invisible (zero-width / bidi override) characters; keeps newlines and tabs. */
const cleanText = (value: unknown) =>
  typeof value === "string"
    ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g, "").trim()
    : "";

/**
 * Cheap bot filter, invisible to guests: the hidden "website" field is only filled by
 * bots, and nobody types a real answer in under 2 seconds. Bots get a fake success so
 * they don't retry. (Add a Vercel Firewall rate-limit rule for POST /api/* on top.)
 */
const looksLikeBot = (body: Record<string, unknown>) =>
  cleanText(body.website) !== "" || (typeof body.elapsedMs === "number" && body.elapsedMs < 2000);

const getDatabase = async () => {
  if (!process.env.DATABASE_URL) return null;
  const { neon } = await import("@neondatabase/serverless");
  return neon(process.env.DATABASE_URL);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const sql = await getDatabase();
  const table = WISHES_TABLE;
  if (!sql) {
    return sendJson(res, 503, { error: "Database is not configured" });
  }

  try {
    if (req.method === "GET") {
      const rows = await sql.query(
        `SELECT id, name, message, created_at
         FROM ${table}
         WHERE published = true
         ORDER BY created_at DESC
         LIMIT 50`,
      ) as WishRow[];

      // Short CDN cache absorbs bursts (everyone opening the link at once). A guest's own
      // new wish is added to the wall client-side, so a few seconds of staleness is fine.
      res.setHeader("Cache-Control", "public, max-age=0, s-maxage=15, stale-while-revalidate=60");
      return sendJson(res, 200, { wishes: rows.map(toWish) });
    }

    const body = req.body && typeof req.body === "object" ? req.body as Record<string, unknown> : {};
    const name = cleanText(body.name);
    const message = cleanText(body.message);

    if (!name || !message) {
      return sendJson(res, 400, { error: "Name and message are required" });
    }
    if (name.length > 120 || message.length > 1000) {
      return sendJson(res, 400, { error: "Name or message is too long" });
    }

    if (looksLikeBot(body)) {
      return sendJson(res, 201, { wish: { id: crypto.randomUUID(), name, message, createdAt: new Date().toISOString() } });
    }

    // A retry after a lost response (flaky 4G) must not post the same wish twice.
    const duplicate = await sql.query(
      `SELECT id, name, message, created_at
       FROM ${table}
       WHERE name = $1 AND message = $2 AND created_at > now() - interval '10 minutes'
       ORDER BY created_at DESC
       LIMIT 1`,
      [name, message],
    ) as WishRow[];
    if (duplicate[0]) {
      return sendJson(res, 200, { wish: toWish(duplicate[0]) });
    }

    const rows = await sql.query(
      `INSERT INTO ${table} (name, message)
       VALUES ($1, $2)
       RETURNING id, name, message, created_at`,
      [name, message],
    ) as WishRow[];

    return sendJson(res, 201, { wish: toWish(rows[0]) });
  } catch (error) {
    console.error("wishes API error", error);
    return sendJson(res, 500, { error: "Unable to process wish" });
  }
}
