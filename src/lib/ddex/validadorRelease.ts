import fs from "fs"
import path from "path"
import sizeOf from "image-size"
import ffmpeg from "fluent-ffmpeg"

export async function validateRelease(release: any) {

  const errors: string[] = []

  /*
  =========================
  RELEASE METADATA
  =========================
  */

  if (!release.title) {
    errors.push("Release title missing")
  }

  if (!release.upc) {
    errors.push("UPC missing")
  }

  if (!release.releaseDate) {
    errors.push("Release date missing")
  }

  if (!release.releaseArtists?.length) {
    errors.push("Release must have at least one artist")
  }

  if (!release.coverUrl) {
    errors.push("Cover artwork missing")
  }

  /*
  =========================
  COVER VALIDATION
  =========================
  */

  if (release.coverUrl) {

    try {

      const dimensions = sizeOf(release.coverUrl)

      if (dimensions.width !== 3000 || dimensions.height !== 3000) {
        errors.push("Cover must be exactly 3000x3000px")
      }

    } catch {
      errors.push("Cover artwork unreadable")
    }

  }

  /*
  =========================
  TRACK VALIDATION
  =========================
  */

  if (!release.tracks?.length) {
    errors.push("Release must contain tracks")
  }

  for (const track of release.tracks) {

    if (!track.title) {
      errors.push(`Track ${track.trackNumber}: missing title`)
    }

    if (!track.isrc) {
      errors.push(`Track ${track.trackNumber}: missing ISRC`)
    }

    if (!track.fileUrl) {
      errors.push(`Track ${track.trackNumber}: missing audio file`)
    }

    if (!track.artists?.length) {
      errors.push(`Track ${track.trackNumber}: missing artist`)
    }

  }

  /*
  =========================
  AUDIO VALIDATION
  =========================
  */

  for (const track of release.tracks) {

    try {

      const metadata = await getAudioMetadata(track.fileUrl)

      if (metadata.sampleRate !== 44100) {
        errors.push(`Track ${track.trackNumber}: must be 44.1kHz`)
      }

      if (metadata.bitDepth !== 16) {
        errors.push(`Track ${track.trackNumber}: must be 16-bit`)
      }

      if (metadata.codec !== "pcm_s16le") {
        errors.push(`Track ${track.trackNumber}: must be WAV PCM`)
      }

    } catch {

      errors.push(`Track ${track.trackNumber}: cannot read audio file`)

    }

  }

  return {
    valid: errors.length === 0,
    errors
  }

}