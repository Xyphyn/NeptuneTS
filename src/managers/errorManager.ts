import { EmbedBuilder } from 'discord.js'
import { globalConfig } from '../config/globalConfig.js'

export const noPermission = (required: string) => {
    const embed = new EmbedBuilder()
        .setTitle('Missing Permission')
        .setDescription(
            "<:WindowsShieldUAC:999005696483926017> You don't have permission to use this command."
        )
        .addFields([
            { name: 'Required', value: `\`${required}\``, inline: true }
        ])
        .setColor('Red')
    return embed
}

export const error = (message: string) => {
    const embed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription(`${globalConfig.errorEmoji} ${message}`)
        .setColor('Red')

    return embed
}

export const warning = (message: string) => {
    return new EmbedBuilder()
        .setTitle('Warning')
        .setDescription(`${globalConfig.warningEmoji} ${message!}`)
        .setColor(0xffc300)
}
