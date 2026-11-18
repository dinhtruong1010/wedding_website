export const config = { runtime: "nodejs" };

type VercelRequest = {
  method?: string;
  body?: unknown;
  url?: string;
  query?: Record<string, string | string[] | undefined>;
};

// "/na" (Nghệ An) shares the Neon database but uses its own tables (*_na),
// so RSVPs and wishes of the two invitations never mix.
const resolveSite = (req: VercelRequest) => {
  const raw = req.query?.site ?? new URL(req.url ?? "/", "http://localhost").searchParams.get("site");
  return (Array.isArray(raw) ? raw[0] : raw) === "na" ? "na" : "hn";
};
// Whitelisted table names only: never built from user input.
const wishesTable = (req: VercelRequest) => (resolveSite(req) === "na" ? "wedding_wishes_na" : "wedding_wishes");

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
  const table = wishesTable(req);
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

      res.setHeader("Cache-Control", "no-store, max-age=0");
      return sendJson(res, 200, { wishes: rows.map(toWish) });
    }

    const body = req.body && typeof req.body === "object" ? req.body as Record<string, unknown> : {};
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!name || !message) {
      return sendJson(res, 400, { error: "Name and message are required" });
    }
    if (name.length > 120 || message.length > 1000) {
      return sendJson(res, 400, { error: "Name or message is too long" });
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
