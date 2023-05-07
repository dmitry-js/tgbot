import { Configuration, OpenAIApi } from 'openai'
import config from 'config'
import { createReadStream } from 'fs'

class OpenAI {
  constructor (apiKey) {
    const configuration = new Configuration({
      apiKey
    })
    this.openAI = new OpenAIApi(configuration)
  }

  async transcription (filepath) {
    try {
      const response = await this.openAI.createTranscription(
        createReadStream(filepath),
        'whisper-1'
      )

      return response.data.text
    } catch (e) {
      console.error(`Error on transcription: ${e.message}`)
    }
  }
}

export const openAI = new OpenAI(config.get('OPENAI_API_KEY'))
