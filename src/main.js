import { Telegraf, session } from 'telegraf'
import process from 'nodemon'
import config from 'config'
import { message } from 'telegraf/filters'

import { ogg } from './ogg.js'
import { openAI } from './openAI.js'
import { code } from 'telegraf/format'

const INITIAL_SESSION = { messages: [] }

const bot = new Telegraf(config.get('TG_TOKEN'))

bot.use(session())

bot.command('start', async (ctx) => {
  ctx.session = INITIAL_SESSION
  await ctx.reply('Waiting for your voice or text message...')
})

bot.on(message('text'), async ctx => {
  ctx.session ??= INITIAL_SESSION

  try {
    await ctx.reply(code('Loading...'))
    ctx.session.messages.push({ role: openAI.roles.USER, content: ctx.message.text })
    const response = await openAI.chat(ctx.session.messages)
    ctx.session.messages.push({ role: openAI.roles.ASSISTANT, content: response.content })

    await ctx.reply(response.content)
  } catch (e) {
    console.error(`Error on text message: ${e.message}`)
  }
})

bot.on(message('voice'), async ctx => {
  ctx.session ??= INITIAL_SESSION

  try {
    await ctx.reply(code('Loading...'))
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
    const userId = await ctx.message.from.id
    const oggPath = await ogg.create({ url: link.href, filename: userId })
    const mp3Path = await ogg.toMP3({ url: oggPath, filename: userId })

    const text = await openAI.transcription(mp3Path)
    await ctx.reply(code(`Your request: ${text}`))

    ctx.session.messages.push({ role: openAI.roles.USER, content: text })
    const response = await openAI.chat(ctx.session.messages)
    ctx.session.messages.push({ role: openAI.roles.ASSISTANT, content: response.content })

    await ctx.reply(response.content)
  } catch (e) {
    console.error(`Error on voice message: ${e.message}`)
  }
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
