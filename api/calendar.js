export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "POST") return res.status(405).end();

  const CAL_TOKEN = process.env.GOOGLE_CALENDAR_TOKEN;
  if (!CAL_TOKEN) return res.json({ ok: false, reason: "no token" });

  const { task, notes, datetime } = req.body;
  if (!task || !datetime) return res.status(400).json({ ok: false });

  const start = new Date(datetime);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const r = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CAL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: task,
        description: notes || undefined,
        start: { dateTime: start.toISOString(), timeZone: "Asia/Jerusalem" },
        end: { dateTime: end.toISOString(), timeZone: "Asia/Jerusalem" },
        colorId: "7",
      }),
    },
  );

  return res.json(await r.json());
}
