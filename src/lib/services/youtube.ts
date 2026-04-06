export async function verifyYoutubeChannel(url: string) {

  const API_KEY = process.env.YOUTUBE_API_KEY;

  console.log("YOUTUBE URL:", url);

  let channelId: string | null = null;

  // canal normal
  const channelMatch =
    url.match(/youtube\.com\/channel\/([^/?]+)/) ||
    url.match(/music\.youtube\.com\/channel\/([^/?]+)/);

  // handle moderno
  const handleMatch =
    url.match(/youtube\.com\/@([^/?]+)/);

  if (channelMatch) {
    channelId = channelMatch[1];
    console.log("CHANNEL ID DETECTED:", channelId);
  }

  if (handleMatch) {

    const handle = handleMatch[1];

    console.log("HANDLE DETECTED:", handle);

    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${handle}&key=${API_KEY}`
    );

    const searchData = await searchRes.json();

    console.log("SEARCH RESULT:", searchData);

    if (!searchData.items?.length) return null;

    channelId = searchData.items[0].snippet.channelId;
  }

  if (!channelId) return null;

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${API_KEY}`
  );

  const data = await res.json();



  if (!data.items?.length) return null;

  const channel = data.items[0];

  return {
    id: channel.id,
    name: channel.snippet.title,
    image: channel.snippet.thumbnails.high.url.split("=")[0],
    youtubeUrl: url
  };

}