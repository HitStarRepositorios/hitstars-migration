import path from "path"
import { calculateMD5 } from "./hash"
import { getDDEXBaseDir } from "./paths"

export function generateArtwork(resourceList: any, release: any) {

  if (!release.coverUrl) return

  const image = resourceList.ele("Image")

  /*
  RESOURCE REFERENCE
  */

  image
    .ele("ResourceReference")
    .txt("IMG1")

  /*
  IMAGE TYPE
  */

  image
    .ele("ImageType")
    .txt("FrontCoverImage")

  /*
  RESOURCE FILE
  */

  const resourceFile = image.ele("ResourceFile")

  const fileName = "cover.jpg"

  resourceFile
    .ele("File")
    .ele("FileName")
    .txt(fileName)

  resourceFile
    .ele("URI")
    .txt(`artwork/${fileName}`)

  /*
  HASH (opcional)
  */

  try {

    const filePath = path.join(
      getDDEXBaseDir(),
      release.id,
      "artwork",
      fileName
    )

    const hash = calculateMD5(filePath)

    if (hash) {

      resourceFile
        .ele("HashSum", { Algorithm: "MD5" })
        .txt(hash)

    }

  } catch {

    // si el archivo aún no existe no rompe el ERN

  }

}