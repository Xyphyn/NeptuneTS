import { EmbedBuilder } from 'discord.js'
import { embedSettings } from '../config/embeds.js'

export const noPermission = (required) => {
    const embed = new EmbedBuilder()
        .setTitle('Missing Permission')
        .setDescription(
            "<:WindowsShieldUAC:824380489409626126> You don't have permission to use this command."
        )
        .addFields([
            { name: 'Required', value: `\`${required}\``, inline: true }
        ])
        .setColor(embedSettings.errorColor)
    return embed
}
