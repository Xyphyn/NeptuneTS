import { EmbedBuilder } from 'discord.js'

export const noPermission = (required: string) => {
    const embed = new EmbedBuilder()
        .setTitle('Missing Permission')
        .setDescription(
            "<:WindowsShieldUAC:824380489409626126> You don't have permission to use this command."
        )
        .addFields([
            { name: 'Required', value: `\`${required}\``, inline: true }
        ])
        .setColor('Red')
    return embed
}
