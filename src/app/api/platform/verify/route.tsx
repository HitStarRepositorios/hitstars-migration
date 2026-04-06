import { NextResponse } from "next/server";
import { verifySpotifyArtist } from "@/lib/services/spotify";
import { verifyAppleArtist } from "@/lib/services/apple";
import { verifyYoutubeChannel } from "@/lib/services/youtube";
import { verifyTikTokProfile } from "@/lib/services/tiktok";
import { verifyInstagramProfile } from "@/lib/services/instagram";
import { verifySoundcloudProfile } from "@/lib/services/soundcloud";
import { verifyAmazonArtist } from "@/lib/services/amazon";

export async function POST(req: Request) {

  console.log("VERIFY ENDPOINT HIT");

  try {

    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ valid: false });
    }

    const { platform, url } = body;

    if (!url) {
      return NextResponse.json({ valid: false });
    }

    /* ---------------- SPOTIFY ---------------- */

if (platform === "SPOTIFY") {

  const artist = await verifySpotifyArtist(url);

  if (!artist) {

    return NextResponse.json({
      valid: false,
      rateLimited: true
    });

  }

  return NextResponse.json({
    valid: true,
    ...artist
  });
}

    /* ---------------- APPLE ---------------- */

    if (platform === "APPLE" || platform === "APPLE_MUSIC") {

      try {

        const artist = await verifyAppleArtist(url);

        if (!artist) {
          return NextResponse.json({ valid: false });
        }

        return NextResponse.json({
          valid: true,
          metadata: artist
        });

      } catch (err) {

        console.log("Apple verification failed");

        return NextResponse.json({
          valid: false
        });

      }

    }

    /* ---------------- YOUTUBE ---------------- */

    if (platform === "YOUTUBE") {

      try {

        const artist = await verifyYoutubeChannel(url);

        if (!artist) {
          return NextResponse.json({ valid: false });
        }

        return NextResponse.json({
          valid: true,
          ...artist
        });

      } catch (err) {

        console.log("YouTube verification failed");

        return NextResponse.json({
          valid: false
        });

      }

    }

    /* ---------------- TIKTOK ---------------- */

    if (platform === "TIKTOK") {

      try {

        const artist = await verifyTikTokProfile(url);

        if (!artist) {
          return NextResponse.json({ valid: false });
        }

        return NextResponse.json({
          valid: true,
          ...artist
        });

      } catch (err) {

        console.log("TikTok verification failed");

        return NextResponse.json({
          valid: false
        });

      }

    }

    /* ---------------- INSTAGRAM ---------------- */

    if (platform === "INSTAGRAM") {



      try {

        const profile = await verifyInstagramProfile(url);


        if (!profile) {
          return NextResponse.json({ valid: false });
        }

        return NextResponse.json({
          valid: true,
          ...profile
        });

      } catch (err) {


        return NextResponse.json({
          valid: false,
          rateLimited: true
        });

      }

    }

    if (platform === "SOUNDCLOUD") {

  const profile = await verifySoundcloudProfile(url);

  if (!profile) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({
    valid: true,
    ...profile
  });

}

if (platform === "AMAZON") {

  const artist = await verifyAmazonArtist(url);

  if (!artist) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({
    valid: true,
    ...artist
  });

}

    return NextResponse.json({ valid: false });

  } catch (error) {

    console.error("VERIFY ENDPOINT ERROR:", error);

    return NextResponse.json({
      valid: false,
      error: "server_error"
    });

  }

}