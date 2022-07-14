import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import ms from "ms";
import { getConfig } from "../config/config.js";

export const data = new SlashCommandBuilder()
    .setName('channel')
    .setDescription('Channel commands')
    .addSubcommand(subcommand => subcommand
        .setName('slowmode')
        .setDescription('Sets slowmode')
        .addStringOption(option => option
            .setName('slowmode')
            .setDescription('The slowmode to set.')
            .setRequired(true)
        )
    )

export const permissions = 'MANAGE_CHANNELS'

export const execute = async (interaction, client) => {
    const slowmode = Math.floor(ms(interaction.options.getString('slowmode')) / 1000) ?? 0
    const channel = interaction.channel

    const embed = new MessageEmbed()
        .setTitle('Slowmode set')
        .setDescription(`${getConfig(interaction).emojiSettings.success} Slowmode was set to ${ms(slowmode * 1000, { long: true }) ?? '0 seconds'}`)
        .setColor(getConfig(interaction).embedSettings.color)

    await channel.setRateLimitPerUser(slowmode);
    await interaction.reply({ embeds: [ embed ] });
}