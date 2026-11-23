// Vercel Serverless Function to sync Work Daily Logbook entries from Notion Database.
// Configure NOTION_TOKEN and optional NOTION_DATABASE_ID in Vercel Environment Variables.
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
      const titleProp = Object.values(props).find((p) => p.type === "title");
      const title = (titleProp?.title || []).map((t) => t.plain_text).join("").trim() || "Untitled";
      const dateProp = Object.values(props).find((p) => p.type === "date");
      const date = dateProp?.date?.start || page.created_time?.slice(0, 10) || "";
      const textProp = Object.values(props).find((p) => p.type === "rich_text");
      const rawNote = (textProp?.rich_text || []).map((t) => t.plain_text).join("").trim();
      const selectProp = Object.values(props).find((p) => p.type === "select" || p.type === "multi_select");
      const category =
        selectProp?.select?.name ||
        (selectProp?.multi_select || []).map((s) => s.name).join(", ") ||
        "Work";

      return {
        id: page.id,
        date,
        title,
        category,
        rawNote,
        url: page.url
      };
    });

    return res.status(200).json({
      entries,
      count: entries.length,
      syncedAt: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Failed to sync Notion database." });
  }
}
