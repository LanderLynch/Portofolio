export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igUserId = process.env.INSTAGRAM_USER_ID || "17841471698579545";
  const username = process.env.INSTAGRAM_USERNAME || "jona.mmzv";
  const profileUrl = `https://www.instagram.com/${username}/`;

  if (!token) {
    return res.status(503).json({
      ok: false,
      configured: false,
      username,
      profileUrl,
      error: "INSTAGRAM_ACCESS_TOKEN belum dikonfigurasi di environment Vercel."
    });
  }

  try {
    const baseEndpoint = token.startsWith("EAA")
      ? `https://graph.facebook.com/v21.0/${encodeURIComponent(igUserId)}/media`
      : `https://graph.instagram.com/me/media`;
    const url =
      `${baseEndpoint}` +
      `?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp` +
      `&limit=9&access_token=${encodeURIComponent(token)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        configured: true,
        username,
        profileUrl,
        error: data?.error?.message || "Gagal mengambil feed dari Instagram Graph API."
      });
    }

    const posts = Array.isArray(data?.data)
      ? data.data.map((item) => ({
          id: item.id,
          caption: item.caption || "",
          mediaType: item.media_type,
          imageUrl: item.media_type === "VIDEO" ? item.thumbnail_url || item.media_url : item.media_url,
          permalink: item.permalink,
          timestamp: item.timestamp
        }))
      : [];

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({
      ok: true,
      configured: true,
      username,
      profileUrl,
      syncedAt: new Date().toISOString(),
      posts
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      configured: true,
      username,
      profileUrl,
      error: err.message || "Terjadi kesalahan saat menghubungi Instagram Graph API."
    });
  }
}
