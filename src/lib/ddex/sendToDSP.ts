import SFTP from "ssh2-sftp-client"
import path from "path"
import { Platform } from "@prisma/client"

export async function sendToDSP(
  zipPath: string,
  dsp: Platform
) {

  console.log(`Sending ${zipPath} to ${dsp}`)

  const sftp = new SFTP()

  await sftp.connect({
    host: process.env.DSP_HOST,
    port: 22,
    username: process.env.DSP_USER,
    password: process.env.DSP_PASS
  })

  const fileName = path.basename(zipPath)

  /*
  DSP-specific folder
  */

  const remoteDir = `/incoming/${dsp}`

  await sftp.mkdir(remoteDir, true)

  const remotePath = `${remoteDir}/${fileName}`

  await sftp.put(zipPath, remotePath)

  await sftp.end()

  console.log(`Upload finished for ${dsp}`)

}