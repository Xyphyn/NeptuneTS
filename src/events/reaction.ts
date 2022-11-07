import { EmbedBuilder, MessageReaction } from 'discord.js'
import fetch from 'node-fetch'
import puppeteer from 'puppeteer'
import { getConfig } from '../config/config.js'
import { globalConfig } from '../config/globalConfig.js'

export const name = 'messageReactionAdd'
export const once = false

const browser = await puppeteer.launch({ args: ['--no-sandbox'] })

export const getTranslation = async (url: string) => {
    return new Promise(async (resolve, reject) => {
        const page = await browser.newPage()
        await page.goto(`${url}`)
        let element
        try {
            element = await page.waitForSelector(
                '#yDmH0d > c-wiz > div > div.WFnNle > c-wiz > div.OlSOob > c-wiz > div.ccvoYb.EjH7wc > div.AxqVh > div.OPPzxe > c-wiz.sciAJc > div > div.usGWQd > div > div.lRu31 > span.HwtZe > span > span'
            )
        } catch (e) {
            resolve('Error getting translation')
            return
        }
        let text = await page.evaluate(
            (element: any) => element!.innerText,
            element
        )
        page.close()
        resolve(text)
    })
}

const translate = async (
    lang: string,
    reaction: MessageReaction,
    content: string
) => {
    const flag = reaction.emoji.name
    const language = languages[flag!]
    const languageName = languageNames[language]

    const embed = new EmbedBuilder()
        .setTitle('Translation')
        .setDescription(
            `${globalConfig.loadingEmoji} Translating to **${languageName}**...`
        )

    if (reaction.message.guild != undefined)
        embed.setColor(getConfig(reaction.message.guild.id).embedSettings.color)
    else embed.setColor(globalConfig.embedColor)

    const msg = await reaction.message.reply({
        embeds: [embed]
    })

    const translation = await getTranslation(
        `https://translate.google.com/?sl=auto&tl=${language}&text=${encodeURIComponent(
            content
        )}&op=translate`
    )

    embed
        .setDescription(`${translation}`)
        .setFooter({ text: `Translated to ${flag} ${languageName}` })
        .setAuthor({
            name: reaction.message.author!.username,
            iconURL: reaction.message.author!.avatarURL()!
        })

    msg.edit({ embeds: [embed] })
}

const languages: any = {
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
    '🇵🇹': 'pt'
}

export const languageNames: any = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    ru: 'Russian',
    'zh-CN': 'Chinese',
    ja: 'Japanese',
    in: 'Hindi',
    pl: 'Polish',
    uk: 'Ukrainian',
    it: 'Italian',
    de: 'German',
    iw: 'Hebrew',
    sv: 'Swedish',
    ko: 'Korean',
    el: 'Greek',
    pt: 'Portuguese'
}

export const execute = async (reaction: MessageReaction) => {
    // if (!(getConfig(reaction.message.guild.id).translation.enabled)) return
    if (reaction.partial) await reaction.fetch()
    await reaction.message.fetch()

    let content = reaction.message.content

    if (reaction.message.embeds[0] != undefined) {
        // It's an embed.
        const embedData = reaction.message.embeds[0]
        if (embedData.description == undefined || embedData.description == '')
            return

        content = embedData.description
    } else {
        if (reaction.message.content == '') return
    }

    if (reaction!.emoji.name! in languages) {
        translate(languages[reaction.emoji.name!], reaction, content!)
    }
}
