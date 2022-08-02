import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder
} from 'discord.js'
import { Command } from '../types/types'

export const data: Command = {
    name: 'about',
    description: 'About this bot!',
    dmPermission: false
}

export const execute = async (interaction: ChatInputCommandInteraction) => {
    const embed = new EmbedBuilder()
        .setColor('#5865f2')
        .setTitle('Neptune')
        .setDescription(`A general purpose discord bot.`)
        .addFields([
            { name: 'Version', value: '0.6.0' },
            { name: 'Branch', value: 'main' }
        ])

    await interaction.reply({
        embeds: [embed]
    })
}
