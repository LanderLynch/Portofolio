// Vercel Serverless Function to sync Work Daily Logbook entries from Notion Database.
// Configure NOTION_TOKEN and optional NOTION_DATABASE_ID in Vercel Environment Variables.
function extractPlainText(prop) {
  if (!prop) return "";
  if (prop.type === "title") {
    return (prop.title || []).map((t) => t.plain_text).join("").trim();
  }
  if (prop.type === "rich_text") {
    return (prop.rich_text || []).map((t) => t.plain_text).join("").trim();
  }
  return "";
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const notionToken = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID || "3d7a22b9b6b2802d9312c1d4854d78d8";

  if (!notionToken) {
    return res.status(503).json({
      error: "NOTION_TOKEN is not configured on this server. Using bundled local logbook data."
    });
  }

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${notionToken}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        page_size: 100
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText || "Notion API request failed." });
    }

    const data = await response.json();
    const entries = (data.results || []).map((page) => {
      const props = page.properties || {};
      const propEntries = Object.entries(props);

      const titleEntry = propEntries.find(([, p]) => p.type === "title");
      const titleText = extractPlainText(titleEntry?.[1]) || "Untitled";

      const dateEntry = propEntries.find(([, p]) => p.type === "date");
      const rawDate = dateEntry?.[1]?.date?.start || "";

      const workPropEntry =
        propEntries.find(([name, p]) => p.type === "rich_text" && /^work$/i.test(name.trim())) ||
        propEntries.find(([name, p]) => p.type === "rich_text" && /work/i.test(name) && !/outside/i.test(name)) ||
        propEntries.find(([, p]) => p.type === "rich_text");
      const rawNote = extractPlainText(workPropEntry?.[1]);

      const filesCount = propEntries
        .filter(([, p]) => p.type === "files")
        .reduce((acc, [, p]) => acc + (Array.isArray(p.files) ? p.files.length : 0), 0);

      const selectProp = Object.values(props).find((p) => p.type === "select" || p.type === "multi_select");
      const category =
        selectProp?.select?.name ||
        (selectProp?.multi_select || []).map((s) => s.name).join(", ") ||
        "Work";

      return {
        id: page.id,
        date: rawDate || titleText,
        title: titleText,
        category,
        rawNote,
        attachments: filesCount,
        lastEditedTime: page.last_edited_time || page.created_time || "",
        url: page.url
      };
    });

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({
      entries,
      count: entries.length,
      syncedAt: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Failed to sync Notion database." });
  }
}
