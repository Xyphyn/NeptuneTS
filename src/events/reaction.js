import { MessageEmbed } from "discord.js"
import fetch from "node-fetch"
import puppeteer from "puppeteer"
import { getConfig } from "../config/config.js"

export const name = 'messageReactionAdd'
export const once = false

const browser = await puppeteer.launch({ args: [ '--no-sandbox' ] })
const page = await browser.newPage()

const result = async (url) => {
    return new Promise(async (resolve, reject) => {
        await page.goto(`${url}`)
        let element = await page.waitForSelector('#yDmH0d > c-wiz > div > div.WFnNle > c-wiz > div.OlSOob > c-wiz > div.ccvoYb.EjH7wc > div.AxqVh > div.OPPzxe > c-wiz.P6w8m.BDJ8fb > div.dePhmb > div > div.J0lOec > span.VIiyi')
        let text = await page.evaluate(element => element.innerText, element)
        resolve(text)
    })
}

const translate = async (lang, reaction) => {
    const flag = reaction.emoji.name
    const language = languages[flag]
    const languageName = languageNames[language]

    const embed = new MessageEmbed()
        .setTitle('Translation')
        .setDescription(`<a:WindowsLoading:998707398267130028> Translating to **${languageName}**...`)
        .setColor(getConfig(reaction.message.guild.id).embedSettings.color)

    const msg = await reaction.message.reply({
        embeds: [ embed ]
    })

    const translation = await result(`https://translate.google.com/?sl=auto&tl=${language}&text=${encodeURIComponent(reaction.message.content)}&op=translate`)

    embed.setDescription(`${translation}`).setFooter({ text: `Translated to ${flag} ${languageName}` }).setAuthor({ name: reaction.message.author.username, iconURL: reaction.message.author.avatarURL() })

    msg.edit({ embeds: [ embed ] })
}

const languages = {
    '🇬🇧': 'en',
    '🇺🇸': 'en',
    '🇪🇸': 'es',
    '🇫🇷': 'fr',
    '🇷🇺': 'ru',
}

const languageNames = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'ru': 'Russian',
}

export const execute = async (reaction) => {
    if (reaction.message.author.bot) return 
    // if (!(getConfig(reaction.message.guild.id).translation.enabled)) return

    if (reaction.emoji.name in languages) {
        translate(languages[reaction.emoji.name], reaction)
    }
}