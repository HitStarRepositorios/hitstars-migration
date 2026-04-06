import path from "path"
import { calculateMD5 } from "./hash"
import { convertSecondsToDuration } from "./utils"




export function generateTracks(
  resourceList: any,
  release: any,
  parties: Map<string, string>,
  trackHashes: Record<string, string>
) {

  const tracks = [...release.tracks].sort(
    (a, b) => a.trackNumber - b.trackNumber
  )

  tracks.forEach((track: any) => {

    const soundRecording = resourceList.ele("SoundRecording")

    addResourceReference(soundRecording, track)
    addISRC(soundRecording, track)
    addISWC(soundRecording, track)

    addSoundRecordingType(soundRecording)
    addRecordingFormat(soundRecording)
    addTrackLanguage(soundRecording, release)
    addTrackGenre(soundRecording, release)

    addTitle(soundRecording, track)
    addDisplayArtists(soundRecording, track, parties)
    addResourceContributors(soundRecording, track, parties)
    addDuration(soundRecording, track)
    addRecordingEdition(soundRecording, track)
    addParentalWarning(soundRecording, track)
    addTechnicalDetails(soundRecording, track)
    addResourceFile(soundRecording, track, release, trackHashes)

  })

}

/* ------------------------------------------------ */
/* RESOURCE REFERENCE */
/* ------------------------------------------------ */

function addResourceReference(node: any, track: any) {

  node
    .ele("ResourceReference")
    .txt(`SR${track.trackNumber}`)

}

/* ------------------------------------------------ */
/* ISRC */
/* ------------------------------------------------ */

function addISRC(node: any, track: any) {

  if (!track.isrc) return

  const soundRecordingId = node.ele("SoundRecordingId")

  soundRecordingId
    .ele("ISRC")
    .txt(track.isrc)

}

/* ------------------------------------------------ */
/* TITLE */
/* ------------------------------------------------ */

function addTitle(node: any, track: any) {

  const title = node.ele("ReferenceTitle")

  title
    .ele("TitleText")
    .txt(track.title)

}

/* ------------------------------------------------ */
/* DISPLAY ARTISTS */
/* ------------------------------------------------ */

function addDisplayArtists(node: any, track: any, parties: Map<string, string>) {

  if (!track.artists?.length) return

  track.artists.forEach((artist: any, index: number) => {

    const displayArtist = node.ele("DisplayArtist")

    displayArtist
      .ele("SequenceNumber")
      .txt(index + 1)

    displayArtist
      .ele("PartyReference")
      .txt(parties.get(artist.artistName))

    displayArtist
      .ele("ArtistRole")
      .txt(mapArtistRole(artist.role))

  })

}

/* ------------------------------------------------ */
/* RESOURCE CONTRIBUTORS */
/* ------------------------------------------------ */

function addResourceContributors(node: any, track: any, parties: Map<string, string>) {

  let contributorIndex = 1

  if (track.publishingCredits?.length) {

    track.publishingCredits.forEach((credit: any) => {

      const contributor = node.ele("ResourceContributor")

      contributor
        .ele("SequenceNumber")
        .txt(contributorIndex++)

      const name = `${credit.firstName || ""} ${credit.lastName || ""}`.trim()

      contributor
        .ele("PartyReference")
        .txt(parties.get(name))

      contributor
        .ele("ResourceContributorRole")
        .txt(mapPublishingRole(credit.role))

    })

  }

  if (track.masterParties?.length) {

    track.masterParties.forEach((party: any) => {

      const contributor = node.ele("ResourceContributor")

      contributor
        .ele("SequenceNumber")
        .txt(contributorIndex++)

      contributor
        .ele("PartyReference")
        .txt(parties.get(party.legalName))

      contributor
        .ele("ResourceContributorRole")
        .txt(mapMasterRole(party.role))

    })

  }

}

/* ------------------------------------------------ */
/* DURATION */
/* ------------------------------------------------ */

function addDuration(node: any, track: any) {

  if (!track.duration) return

  node
    .ele("Duration")
    .txt(convertSecondsToDuration(track.duration))

}

/* ------------------------------------------------ */
/* EDITION */
/* ------------------------------------------------ */

function addRecordingEdition(node: any, track: any) {

  if (!track.recordingEdition) return

  const edition = node.ele("SoundRecordingEdition")

  edition
    .ele("EditionType")
    .txt(mapRecordingEdition(track.recordingEdition))

}

/* ------------------------------------------------ */
/* PARENTAL */
/* ------------------------------------------------ */

function addParentalWarning(node: any, track: any) {

  node
    .ele("ParentalWarningType")
    .txt(track.explicit ? "Explicit" : "NotExplicit")

}

/* ------------------------------------------------ */
/* TECHNICAL */
/* ------------------------------------------------ */

function addTechnicalDetails(node: any, track: any) {

  if (!track.audioCodec && !track.sampleRate && !track.bitDepth) return

  const technical = node.ele("TechnicalSoundRecordingDetails")

  technical
    .ele("TechnicalResourceDetailsReference")
    .txt(`TR${track.trackNumber}`)

  if (track.audioCodec) {

    technical
      .ele("AudioCodecType")
      .txt(mapAudioCodec(track.audioCodec))

  }

  if (track.sampleRate) {

    technical
      .ele("SamplingRate")
      .txt(track.sampleRate)

  }

  if (track.bitDepth) {

    technical
      .ele("BitsPerSample")
      .txt(track.bitDepth)

  }

}

/* ------------------------------------------------ */
/* RESOURCE FILE */
/* ------------------------------------------------ */

function addResourceFile(
  node: any,
  track: any,
  release: any,
  trackHashes: Record<string, string>
) {

  const resourceFile = node.ele("ResourceFile")

  const fileName = `${track.trackNumber}.wav`

  resourceFile
    .ele("File")
    .ele("FileName")
    .txt(fileName)

  const md5 = trackHashes?.[track.id]

  if (md5) {

    const hash = resourceFile.ele("HashSum")

    hash
      .ele("HashSumAlgorithmType")
      .txt("MD5")

    hash
      .ele("HashSumValue")
      .txt(md5)

  }

  resourceFile
    .ele("URI")
    .txt(`resources/${fileName}`)

}

/* ------------------------------------------------ */
/* ROLE MAPPERS */
/* ------------------------------------------------ */

function mapArtistRole(role: string) {

  switch (role) {

    case "MAIN": return "MainArtist"
    case "FEATURED": return "FeaturedArtist"
    case "PRODUCER": return "Producer"
    case "REMIXER": return "Remixer"
    default: return "Artist"

  }

}

function mapPublishingRole(role: string) {

  switch (role) {

    case "AUTOR_MUSICA": return "Composer"
    case "AUTOR_LETRA": return "Lyricist"
    case "COMPOSER": return "Composer"
    case "LYRICIST": return "Lyricist"
    default: return "Author"

  }

}

function mapMasterRole(role: string) {

  switch (role) {

    case "PRODUCER": return "Producer"
    case "ARTIST": return "MainArtist"
    case "REMIXER": return "Remixer"
    case "ENGINEER": return "Engineer"
    default: return "Contributor"

  }

}

function mapRecordingEdition(edition: string) {

  switch (edition) {

    case "REMASTERED": return "Remastered"
    case "RADIO_EDIT": return "RadioEdit"
    case "LIVE": return "Live"
    case "ACOUSTIC": return "Acoustic"
    case "INSTRUMENTAL": return "Instrumental"
    default: return "Original"

  }

}

function mapAudioCodec(codec: string) {

  const c = codec.toUpperCase()

  if (c === "WAV") return "PCM"
  if (c === "FLAC") return "FLAC"
  if (c === "MP3") return "MP3"

  return "PCM"

}

function addSoundRecordingType(node: any) {

  node
    .ele("SoundRecordingType")
    .txt("MusicalWorkSoundRecording")

}

function addRecordingFormat(node: any) {

  node
    .ele("RecordingFormat")
    .txt("Stereo")

}

function addTrackLanguage(node: any, release: any) {

  if (!release.language) return

  node
    .ele("LanguageOfPerformance")
    .txt(release.language)

}

function addTrackGenre(node: any, release: any) {

  if (!release.genre) return

  const genre = node.ele("Genre")

  genre
    .ele("GenreText")
    .txt(release.genre)

}

function addISWC(node: any, track: any) {

  if (!track.iswc) return

  const musicalWork = node.ele("MusicalWorkId")

  musicalWork
    .ele("ISWC")
    .txt(track.iswc)

}