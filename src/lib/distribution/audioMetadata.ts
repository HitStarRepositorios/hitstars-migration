import ffmpeg from "fluent-ffmpeg"

export function getAudioMetadata(filePath: string): Promise<any> {

  return new Promise((resolve, reject) => {

    ffmpeg.ffprobe(filePath, (err, metadata) => {

      if (err) {
        return reject(err)
      }

      const stream = metadata.streams.find(s => s.codec_type === "audio")

      resolve({
        sampleRate: Number(stream.sample_rate),
        bitDepth: stream.bits_per_sample,
        codec: stream.codec_name
      })

    })

  })

}