import { Telegraf } from 'telegraf'
import process from 'nodemon'
import config from 'config'
import { message } from 'telegraf/filters'
import { logger } from './utils/index.js'

const bot = new Telegraf(config.get('TG_TOKEN'))

bot.on(message('text'), async ctx => {
  await ctx.reply(logger(ctx.message))
})

bot.command('start', async (ctx) => {
  await ctx.reply(logger(ctx.message))
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
