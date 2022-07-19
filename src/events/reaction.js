import { EmbedBuilder } from "discord.js"
import fetch from "node-fetch"
import puppeteer from "puppeteer"
import { getConfig } from "../config/config.js"

export const name = 'messageReactionAdd'
export const once = false

const browser = await puppeteer.launch({ args: ['--no-sandbox'] })

export const getTranslation = async (url) => {
    return new Promise(async (resolve, reject) => {
        const page = await browser.newPage()
        await page.goto(`${url}`)
        let element
        try {
            element = await page.waitForSelector('#yDmH0d > c-wiz > div > div.WFnNle > c-wiz > div.OlSOob > c-wiz > div.ccvoYb.EjH7wc > div.AxqVh > div.OPPzxe > c-wiz.P6w8m.BDJ8fb > div.dePhmb > div > div.J0lOec > span.VIiyi')
        } catch (e) {
            resolve('Error getting translation')
            return
        }
        let text = await page.evaluate(element => element.innerText, element)
        page.close()
        resolve(text)
    })
}

const translate = async (lang, reaction, content) => {
    const flag = reaction.emoji.name
    const language = languages[flag]
    const languageName = languageNames[language]

    const embed = new EmbedBuilder()
        .setTitle('Translation')
        .setDescription(`<a:WindowsLoading:998707398267130028> Translating to **${languageName}**...`)

    if (reaction.message.guild != undefined) embed.setColor(getConfig(reaction.message.guild.id).embedSettings.color)
    else embed.setColor(0x0099ff)

    const msg = await reaction.message.reply({
        embeds: [ embed ]
    })

    const translation = await getTranslation(`https://translate.google.com/?sl=auto&tl=${language}&text=${encodeURIComponent(content)}&op=translate`)

    embed.setDescription(`${translation}`).setFooter({ text: `Translated to ${flag} ${languageName}` }).setAuthor({ name: reaction.message.author.username, iconURL: reaction.message.author.avatarURL() })

    msg.edit({ embeds: [ embed ] })
}

const languages = {
    '🇬🇧': 'en',
    '🇺🇸': 'en',
    '🇪🇸': 'es',
    '🇫🇷': 'fr',
    '🇷🇺': 'ru',
    '🇨🇳': 'zh-CN',
    '🇯🇵': 'ja',
    '🇮🇳': 'in',
    '🇵🇱': 'pl',
    '🇺🇦': 'uk',
    '🇮🇹': 'it',
    '🇩🇪': 'de',
    '🇮🇱': 'iw',
    '🇸🇻': 'sv',
    '🇰🇷': 'ko',
    '🇬🇷': 'el',
}

export const languageNames = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'ru': 'Russian',
    'zh-CN': 'Chinese',
    'ja': 'Japanese',
    'in': 'Hindi',
    'pl': 'Polish',
    'uk': 'Ukrainian',
    'it': 'Italian',
    'de': 'German',
    'iw': 'Hebrew',
    'sv': 'Swedish',
    'ko': 'Korean',
    'el': 'Greek',
}

export const execute = async (reaction) => {
    // if (!(getConfig(reaction.message.guild.id).translation.enabled)) return
    if (reaction.partial) await reaction.fetch()
    await reaction.message.fetch()

    let content = reaction.message.content
    
    if (reaction.message.embeds[0] != undefined) {
        // It's an embed.
        const embedData = reaction.message.embeds[0]
        if (embedData.description == undefined || embedData.description == '') return

        content = embedData.description
    } else {
        if (reaction.message.content == '') return
    }

    if (reaction.emoji.name in languages) {
        translate(languages[reaction.emoji.name], reaction, content)
    }
}