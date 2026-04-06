export async function verifySoundcloudProfile(url: string) {

  if (!url.includes("soundcloud.com")) {
    return null;
  }

  return {
    name: "SoundCloud",
    image: "/logos/soundcloud.png",
    soundcloudUrl: url
  };

}