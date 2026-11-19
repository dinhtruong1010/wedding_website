export const config = { runtime: "nodejs" };

/**
 * Returns an .ics file for "Add to calendar" on iPhone/iPad/Mac. iOS opens a
 * `text/calendar` response straight in the Calendar app, which a client-side
 * blob or data: URL can't do reliably (especially inside Zalo/Messenger).
 * The event details come from the query string, built by the client from its config.
 */

type VercelRequest = {
  method?: string;
  url?: string;
};

type VercelResponse = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
};

const STAMP = /^\d{8}T\d{6}Z$/;

/** RFC 5545 text escaping; also strips control characters and caps the length. */
const icsText = (value: string | null, max = 300) =>
  (value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .slice(0, max)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    return res.end();
  }

  const params = new URL(req.url ?? "/", "http://localhost").searchParams;
  const start = params.get("start") ?? "";
  const end = params.get("end") ?? "";
  if (!STAMP.test(start) || !STAMP.test(end)) {
    res.statusCode = 400;
    return res.end("Invalid start/end");
  }

  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//wedding-invitation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${start}-${icsText(params.get("title"), 60).replace(/[^A-Za-z0-9]/g, "")}@wedding`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${icsText(params.get("title"), 120)}`,
    `LOCATION:${icsText(params.get("location"))}`,
    `DESCRIPTION:${icsText(params.get("details"))}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsText(params.get("title"), 120)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", 'inline; filename="dam-cuoi.ics"');
  res.setHeader("Cache-Control", "public, max-age=3600");
  return res.end(body);
}
