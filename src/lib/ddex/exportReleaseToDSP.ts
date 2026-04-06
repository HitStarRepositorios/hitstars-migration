import { exportRelease } from "./exportRelease"

export async function exportReleaseToDSP(
  releaseId: string,
  dsp: string
) {

  switch (dsp) {

    case "SPOTIFY":
      return exportRelease(releaseId)

    case "APPLE_MUSIC":
      return exportRelease(releaseId)

    case "AMAZON":
      return exportRelease(releaseId)

    case "YOUTUBE_MUSIC":
      return exportRelease(releaseId)

    default:
      throw new Error("DSP not supported")
  }

}