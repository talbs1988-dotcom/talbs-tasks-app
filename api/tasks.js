export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const BASE = process.env.AIRTABLE_BASE_ID;
  const TABLE = process.env.AIRTABLE_TABLE_ID || "tblbM772kokDbyE7q";
  const PAT = process.env.AIRTABLE_PAT;
  const CAL_TOKEN = process.env.GOOGLE_CALENDAR_TOKEN;

  // No Airtable configured — signal frontend to use localStorage
  if (!PAT || !BASE) {
    return res.json({ mode: "localStorage" });
  }

  if (req.method === "GET") {
    const params = new URLSearchParams({
      filterByFormula: "OR({סטטוס}='פתוח',{סטטוס}='בטיפול')",
      "sort[0][field]": "תאריך יצירה",
      "sort[0][direction]": "asc",
    });
    const r = await fetch(
      `https://api.airtable.com/v0/${BASE}/${TABLE}?${params}`,
      { headers: { Authorization: `Bearer ${PAT}` } },
    );
    const data = await r.json();
    return res.json(data);
  }

  if (req.method === "PATCH") {
    const { id, status, notes } = req.body;
    const today = new Date().toISOString().split("T")[0];

    // Sub-task update (notes only)
    if (notes !== undefined && !status) {
      const r = await fetch(
        `https://api.airtable.com/v0/${BASE}/${TABLE}/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${PAT}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fields: { הערות: notes } }),
        },
      );
      return res.json(await r.json());
    }

    const fields =
      status === "סגור"
        ? { סטטוס: "סגור", "תאריך סגירה": today }
        : { סטטוס: "פתוח" };

    const r = await fetch(
      `https://api.airtable.com/v0/${BASE}/${TABLE}/${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${PAT}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      },
    );
    const data = await r.json();
    return res.json(data);
  }

  if (req.method === "POST") {
    const { task, subtasks = [], datetime } = req.body;
    const today = new Date().toISOString().split("T")[0];

    // Build הערות from subtasks
    const notes =
      subtasks.length > 0
        ? subtasks.map((s, i) => `${i + 1}. ${s}`).join("\n")
        : "";

    const fields = {
      משימה: task,
      סטטוס: "פתוח",
      "תאריך יצירה": today,
      מקור: "צ'אט קלוד",
      ...(notes ? { הערות: notes } : {}),
    };

    const r = await fetch(`https://api.airtable.com/v0/${BASE}/${TABLE}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });
    const data = await r.json();

    // If datetime provided — create Google Calendar event
    if (datetime && CAL_TOKEN) {
      try {
        const start = new Date(datetime);
        const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour default

        const eventBody = {
          summary: task,
          description: notes || undefined,
          start: { dateTime: start.toISOString(), timeZone: "Asia/Jerusalem" },
          end: { dateTime: end.toISOString(), timeZone: "Asia/Jerusalem" },
          colorId: "7", // blue = Peacock
        };

        await fetch(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${CAL_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(eventBody),
          },
        );
      } catch (e) {
        console.error("Calendar error:", e);
      }
    }

    return res.json(data);
  }

  res.status(405).end();
}
