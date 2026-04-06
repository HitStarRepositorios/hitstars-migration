export async function verifyTikTokProfile(url: string) {

  try {

    // 1️⃣ oEmbed para obtener nombre
    const oembedRes = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
    );

    const oembed = await oembedRes.json();

    let image = oembed.thumbnail_url;

    // 2️⃣ Si no hay imagen → scraping perfil
    if (!image) {

      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept": "text/html"
        }
      });

      const html = await res.text();

      const match = html.match(/"avatarLarger":"([^"]+)"/);

      if (match) {
        image = match[1].replace(/\\u002F/g, "/");
      }

    }

    if (!oembed?.author_name) return null;

    return {
      name: oembed.author_name,
      image,
      tiktokUrl: url
    };

  } catch (error) {

    console.error("TikTok verification error:", error);
    return null;

  }

}