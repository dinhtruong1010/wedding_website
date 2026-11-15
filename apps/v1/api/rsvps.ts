export const config = { runtime: "nodejs" };

type VercelRequest = {
  method?: string;
  body?: unknown;
};

type VercelResponse = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
};

type RsvpRow = {
  id: string;
  guest_name: string;
  attending: boolean;
  party_size: number;
  created_at: string;
  updated_at: string;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const sendJson = (res: VercelResponse, statusCode: number, body: unknown) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
};

const toRsvp = (row: RsvpRow) => ({
  id: row.id,
  guestName: row.guest_name,
  attending: row.attending,
  partySize: row.party_size,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  if (!process.env.DATABASE_URL) {
    return sendJson(res, 503, { error: "Database is not configured" });
  }

  const body = req.body && typeof req.body === "object" ? req.body as Record<string, unknown> : {};
  const guestName = typeof body.guestName === "string" ? body.guestName.trim() : "";
  const attending = body.attending;
  const requestedPartySize = body.partySize;
  const partySizeValue = typeof requestedPartySize === "number" ? requestedPartySize : NaN;
  const submissionId = typeof body.submissionId === "string" ? body.submissionId : "";

  if (!guestName || typeof attending !== "boolean" || !UUID_PATTERN.test(submissionId)) {
    return sendJson(res, 400, { error: "Guest name, attendance, and submission ID are required" });
  }
  if (guestName.length > 120) {
    return sendJson(res, 400, { error: "Guest name is too long" });
  }
  if (attending && (!Number.isInteger(partySizeValue) || partySizeValue < 1 || partySizeValue > 4)) {
    return sendJson(res, 400, { error: "Party size must be between 1 and 4" });
  }

  const partySize = attending ? partySizeValue : 0;

  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      INSERT INTO wedding_rsvps (guest_name, attending, party_size, client_submission_id)
      VALUES (${guestName}, ${attending}, ${partySize}, ${submissionId}::uuid)
      ON CONFLICT (client_submission_id) DO UPDATE
      SET guest_name = EXCLUDED.guest_name,
          attending = EXCLUDED.attending,
          party_size = EXCLUDED.party_size,
          updated_at = now()
      RETURNING id, guest_name, attending, party_size, created_at, updated_at
    ` as RsvpRow[];

    return sendJson(res, 201, { rsvp: toRsvp(rows[0]) });
  } catch (error) {
    console.error("rsvps API error", error);
    return sendJson(res, 500, { error: "Unable to save RSVP" });
  }
}
