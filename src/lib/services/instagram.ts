export async function verifyInstagramProfile(url: string) {

  try {

    const username = new URL(url).pathname.replace(/\//g, "");
    const cleanUrl = `https://www.instagram.com/${username}/`;

    const res = await fetch(cleanUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    const html = await res.text();

    const nameMatch = html.match(/property="og:title" content="([^"]+)"/);
    const imageMatch = html.match(/property="og:image" content="([^"]+)"/);

    const name = nameMatch
      ? nameMatch[1].split("(")[0].trim()
      : username;

    const image = imageMatch
  ? imageMatch[1].replace(/&amp;/g, "&")
  : null;

    return {
      name,
      image,
      instagramUrl: cleanUrl
    };

  } catch (error) {

    console.error("Instagram verification error:", error);
    return null;

  }

}