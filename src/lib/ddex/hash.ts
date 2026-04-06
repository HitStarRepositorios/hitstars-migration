import fs from "fs"
import crypto from "crypto"

export function calculateMD5(filePath: string) {

  const buffer = fs.readFileSync(filePath)

  const hash = crypto
    .createHash("md5")
    .update(buffer)
    .digest("hex")

  return hash

}