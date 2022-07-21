import {
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    SlashCommandBuilder
} from 'discord.js'
import { config, getConfig } from '../config/config.js'

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Returns Discord API Ping')

export const execute = async (
    interaction: ChatInputCommandInteraction,
    client: Client
) => {
    const embed = new EmbedBuilder()
        .setTitle('Discord latency')
        .setDescription(`<:wifi:962042152387477535> ${client.ws.ping}ms`)
        .setColor(getConfig(interaction).embedSettings.color)
    await interaction.reply({
        embeds: [embed]
    })
}
