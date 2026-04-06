export async function verifyAmazonArtist(url: string) {

  if (!url.includes("music.amazon")) {
    return null;
  }

  return {
    name: "Amazon Music",
    image: "/logos/amazonmusic.png",
    amazonUrl: url
  };

}