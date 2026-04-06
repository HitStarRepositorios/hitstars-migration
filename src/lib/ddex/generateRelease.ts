import { normalizeLanguage } from "./languageMap"

export function generateRelease(releaseList: any, release: any) {

  const releaseNode = releaseList.ele("Release")

  /*
  RELEASE REFERENCE
  */

  releaseNode
    .ele("ReleaseReference")
    .txt("R1")

  /*
  RELEASE ID (UPC + CATALOG NUMBER)
  */

  const releaseId = releaseNode.ele("ReleaseId")

  if (release.upc) {
    releaseId
      .ele("ICPN")
      .txt(release.upc)
  }

  if (release.catalogNumber) {
    releaseId
      .ele("CatalogNumber")
      .txt(release.catalogNumber)
  }

  /*
  TITLE
  */

  const title = releaseNode.ele("ReferenceTitle")

  title
    .ele("TitleText")
    .txt(release.title)

/*
DISPLAY ARTIST NAME
*/

if (release.releaseArtists?.length) {

  const displayArtistName = release.releaseArtists
    .map((a: any) => a.artistName)
    .join(", ")

  releaseNode
    .ele("DisplayArtistName")
    .txt(displayArtistName)

}

  /*
  DISPLAY ARTISTS
  */

  if (release.releaseArtists?.length) {

    release.releaseArtists.forEach((artist: any, index: number) => {

      const displayArtist = releaseNode.ele("DisplayArtist")

      displayArtist
        .ele("SequenceNumber")
        .txt(index + 1)

      displayArtist
        .ele("PartyName")
        .ele("FullName")
        .txt(artist.artistName)

      displayArtist
        .ele("ArtistRole")
        .txt("MainArtist")

    })

  }

  /*
  RESOURCE REFERENCES (TRACKS + ARTWORK)
  */

  const resourceRefs = releaseNode.ele("ReleaseResourceReferenceList")

  release.tracks.forEach((track: any) => {

    resourceRefs
      .ele("ReleaseResourceReference")
      .txt(`SR${track.trackNumber}`)

  })

  if (release.coverUrl) {

    resourceRefs
      .ele("ReleaseResourceReference")
      .txt("IMG1")

  }

  /*
  RESOURCE GROUP (TRACK ORDER)
  */

  const resourceGroup = releaseNode.ele("ResourceGroup")

  release.tracks.forEach((track: any) => {

    const groupItem = resourceGroup.ele("ResourceGroupContentItem")

    groupItem
      .ele("SequenceNumber")
      .txt(track.trackNumber)

    groupItem
      .ele("ResourceReference")
      .txt(`SR${track.trackNumber}`)

  })

  /*
  RELEASE DETAILS
  */

  const details = releaseNode.ele("ReleaseDetailsByTerritory")

  details
    .ele("TerritoryCode")
    .txt("Worldwide")

  /*
  RELEASE TYPE
  */

  if (release.distributionType) {

    details
      .ele("ReleaseType")
      .txt(release.distributionType)

  }

  /*
  RELEASE DATE
  */

  const date = release.releaseDate
    ? new Date(release.releaseDate)
    : new Date()

  const isoDate = date
    .toISOString()
    .split("T")[0]

  details
    .ele("ReleaseDate")
    .txt(isoDate)

  details
    .ele("OriginalReleaseDate")
    .txt(isoDate)

  /*
  LANGUAGE
  */

  if (release.language) {

details
  .ele("LanguageOfPerformance")
  .txt(normalizeLanguage(release.language))

  }

  /*
  LABEL
  */

  if (release.label) {

    details
      .ele("LabelName")
      .txt(release.label)

  }

  /*
  GENRE
  */

  /*
  SUB GENRE
  */

if (release.genre || release.subGenre) {

  const genre = details.ele("Genre")

  if (release.genre) {
    genre
      .ele("GenreText")
      .txt(release.genre)
  }

  if (release.subGenre) {
    genre
      .ele("SubGenre")
      .txt(release.subGenre)
  }

}

  /*
  EXPLICIT
  */

  const explicitTrack = release.tracks.find(
    (t: any) => t.explicit
  )

  details
    .ele("ParentalWarningType")
    .txt(explicitTrack ? "Explicit" : "NotExplicit")

  /*
  P-LINE
  */

  if (release.copyrightYear) {

    const pLine = details.ele("PLine")

    pLine
      .ele("Year")
      .txt(String(release.copyrightYear))

    pLine
      .ele("PLineText")
      .txt(`℗ ${release.copyrightYear} ${release.label || "Independent"}`)

  }

  /*
  C-LINE
  */

  if (release.copyrightYear) {

    const cLine = details.ele("CLine")

    cLine
      .ele("Year")
      .txt(String(release.copyrightYear))

    cLine
      .ele("CLineText")
      .txt(`© ${release.copyrightYear} ${release.label || "Independent"}`)

  }

}