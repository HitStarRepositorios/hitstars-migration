import { prisma } from "@/lib/prisma"
import { create } from "xmlbuilder2"

import { generateRelease } from "./generateRelease"
import { generateTracks } from "./generateTrack"
import { generateDeal } from "./generateDeal"
import { generateArtwork } from "./generateArtwork"
import { generatePartyList } from "./generatePartyList"

export async function buildERN(
  releaseId: string,
  trackHashes: Record<string, string> = {}
) {

  const release = await prisma.release.findUnique({
    where: { id: releaseId },
    include: {
      artist: true,
      releaseArtists: true,
      tracks: {
        include: {
          artists: true,
          masterParties: true,
          publishingCredits: true
        }
      }
    }
  })

  if (!release) {
    throw new Error("Release not found")
  }

  /*
  ROOT MESSAGE
  */

  const doc = create({
    version: "1.0",
    encoding: "UTF-8"
  }).ele("NewReleaseMessage", {
    xmlns: "http://ddex.net/xml/ern/382",
    MessageSchemaVersionId: "ern/382"
  })

  /*
  MESSAGE HEADER
  */

  const header = doc.ele("MessageHeader")

  header
    .ele("MessageId")
    .txt(`HITSTAR-${release.id}`)

  header
    .ele("MessageControlType")
    .txt("LiveMessage")

  /*
  SENDER
  */

  const sender = header.ele("MessageSender")

  sender
    .ele("PartyId")
    .txt("HITSTAR")

  sender
    .ele("PartyName")
    .ele("FullName")
    .txt("HIT STAR S.L.")

  /*
  RECIPIENT
  */

  const recipient = header.ele("MessageRecipient")

  recipient
    .ele("PartyId")
    .txt("DSP")

  /*
  CREATED DATE
  */

  header
    .ele("MessageCreatedDateTime")
    .txt(new Date().toISOString())

  /*
  PARTY LIST
  */

  const parties = generatePartyList(doc, release)

  /*
  RESOURCE LIST
  */

  const resourceList = doc.ele("ResourceList")

  generateTracks(resourceList, release, parties, trackHashes)

  generateArtwork(resourceList, release)

  /*
  RELEASE LIST
  */

  const releaseList = doc.ele("ReleaseList")

  generateRelease(releaseList, release)

  /*
  DEAL LIST
  */

  const dealList = doc.ele("DealList")

  generateDeal(dealList, release)

  /*
  FINAL XML
  */

  return doc.end({
    prettyPrint: true
  })
}