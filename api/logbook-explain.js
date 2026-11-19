// Optional Vercel Serverless Function to expand raw Notion daily notes using DeepSeek via Pecut API.
// Configure PECUT_API_KEY and PECUT_API_BASE_URL in Vercel Environment Variables (never commit real keys).
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.PECUT_API_KEY;
  const baseUrl = (process.env.PECUT_API_BASE_URL || "").replace(/\/+$/, "");
  const model = process.env.PECUT_DEEPSEEK_MODEL || "deepseek-chat";

  if (!apiKey || !baseUrl) {
    return res.status(503).json({
      error: "Live AI explanation is not configured on this server. Set PECUT_API_KEY and PECUT_API_BASE_URL in environment variables."
    });
  }

  const { rawNote, date, section } = req.body || {};
  if (!rawNote || typeof rawNote !== "string") {
    return res.status(400).json({ error: "rawNote is required." });
  }

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 450,
        messages: [
          {
            role: "system",
            content:
              "Kamu adalah asisten dokumentasi portofolio. Ubah catatan harian mentah (raw note) menjadi penjelasan aktivitas yang jelas, terstruktur, dan profesional dalam bahasa Indonesia dalam 2-4 kalimat tanpa mengarang angka atau fakta yang tidak ada di catatan."
          },
          {
            role: "user",
            content: `Tanggal: ${date || "-"}\nKategori: ${section || "Daily Activity"}\nCatatan mentah: ${rawNote}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText || "Upstream AI request failed." });
    }

    const data = await response.json();
    const explanation = data?.choices?.[0]?.message?.content?.trim();
    if (!explanation) {
      return res.status(502).json({ error: "Empty response from AI model." });
    }

    return res.status(200).json({ explanation, model });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Unexpected server error." });
  }
}
