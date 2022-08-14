import {
    ChatInputCommandInteraction,
    ContextMenuCommandInteraction,
    EmbedBuilder,
    Guild,
    Interaction,
    MessageContextMenuCommandInteraction
} from 'discord.js'
import { getConfig } from '../config/config.js'
import { globalConfig } from '../config/globalConfig.js'

export const loading = async (
    title: string,
    desc: string,
    interaction:
        | ChatInputCommandInteraction
        | MessageContextMenuCommandInteraction
) => {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(`${globalConfig.loadingEmoji} ${desc}`)
        .setColor(getConfig(interaction).embedSettings.color)

    await interaction.reply({
        embeds: [embed]
    })
}

export const loadingEmbed = (title: string, desc: string) => {
    const color: any = globalConfig.embedColor
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(`${globalConfig.loadingEmoji} ${desc}`)
        .setColor(color)
    return embed
}

export const embed = (
    title: string,
    desc: string,
    guildColor: boolean,
    interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction
) => {
    const embed = new EmbedBuilder().setTitle(title).setDescription(desc)
    if (guildColor) embed.setColor(getConfig(interaction).embedSettings.color)
}

export const clamp = (num: number, min: number, max: number) =>
    Math.min(Math.max(num, min), max)
