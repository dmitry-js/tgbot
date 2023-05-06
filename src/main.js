import { Telegraf } from 'telegraf'
import process from 'nodemon'
import config from 'config'
import { message } from 'telegraf/filters'

import { logger } from './utils/index.js'
import { ogg } from './ogg.js'

const bot = new Telegraf(config.get('TG_TOKEN'))

bot.on(message('text'), async ctx => {
  await ctx.reply(logger(ctx.message))
})

bot.on(message('voice'), async ctx => {
  try {
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
    const userId = await ctx.message.from.id
    const oggPath = await ogg.create({ url: link.href, filename: userId })
    const mp3Path = await ogg.toMP3({ url: oggPath, filename: userId })
    await ctx.reply(logger(mp3Path))
  } catch (e) {
    console.error(`Error on voice message: ${e.message}`)
  }
})

bot.command('start', async (ctx) => {
  await ctx.reply(logger(ctx.message))
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
