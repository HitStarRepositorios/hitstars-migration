export function generatePartyList(root: any, release: any) {

  const partyList = root.ele("PartyList")

  const parties = new Map<string, string>()

  let index = 1

  function register(name: string) {

    if (!name) return

    if (!parties.has(name)) {

      const ref = `P${index++}`

      parties.set(name, ref)

      const party = partyList.ele("Party")

      party
        .ele("PartyReference")
        .txt(ref)

      party
        .ele("PartyName")
        .ele("FullName")
        .txt(name)

    }

  }

  /*
  RELEASE ARTISTS
  */

  release.releaseArtists?.forEach((a: any) => register(a.artistName))

  /*
  TRACK ARTISTS
  */

  release.tracks?.forEach((track: any) => {

    track.artists?.forEach((a: any) => register(a.artistName))

    track.masterParties?.forEach((p: any) => register(p.legalName))

    track.publishingCredits?.forEach((c: any) => {

      const name = `${c.firstName || ""} ${c.lastName || ""}`.trim()

      register(name)

    })

  })

  return parties

}