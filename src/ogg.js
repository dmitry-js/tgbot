import axios from 'axios'
import ffmpeg from 'fluent-ffmpeg'
import installer from '@ffmpeg-installer/ffmpeg'
import { createWriteStream } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

import { removeFile } from './utils/files.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

class OggConverter {
  constructor () {
    ffmpeg.setFfmpegPath(installer.path)
  }

  toMP3 ({ url, filename }) {
    try {
      const outputPath = resolve(dirname(url), `${filename}.mp3`)

      return new Promise((resolve, reject) => {
        ffmpeg(url)
          .inputOption('-t 30')
          .output(outputPath)
          .on('end', () => {
            removeFile(url)
            resolve(outputPath)
          })
          .on('error', (e) => reject(e))
          .run()
      })
    } catch (e) {
      console.error(`Error converting to mp3: ${e.message}`)
    }
  }

  async create ({ url, filename }) {
    try {
      const oggPath = resolve(__dirname, '../voices/', `${filename}.ogg`)
      const response = await axios({
        method: 'get',
        url,
        responseType: 'stream'
      })

      return new Promise((resolve) => {
        const stream = createWriteStream(oggPath)
        response.data.pipe(stream)
        stream.on('finish', () => resolve(oggPath))
      })
    } catch (e) {
      console.error(`Error on creating ogg: ${e.message}`)
    }
  }
}

export const ogg = new OggConverter()
