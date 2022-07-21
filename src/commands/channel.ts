import {
    ChatInputCommandInteraction,
    GuildChannel,
    PermissionsBitField
} from 'discord.js'
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import ms from 'ms'
import { getConfig } from '../config/config.js'

export const data = new SlashCommandBuilder()
    .setName('channel')
    .setDescription('Channel commands')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('slowmode')
            .setDescription('Sets slowmode')
            .addStringOption((option) =>
                option
                    .setName('slowmode')
                    .setDescription('The slowmode to set.')
                    .setRequired(true)
            )
    )

export const permissions = PermissionsBitField.Flags.ManageChannels
export const permissionsString = 'Manage Channels'

export const execute = async (interaction: ChatInputCommandInteraction) => {
    const slowmode =
        Math.floor(ms(interaction.options.getString('slowmode')!) / 1000) ?? 0
    const channel: any = interaction.channel

    const embed = new EmbedBuilder()
        .setTitle('Slowmode set')
        .setDescription(
            `${
                getConfig(interaction).emojiSettings.success
            } Slowmode was set to ${
                ms(slowmode * 1000, { long: true }) ?? '0 seconds'
            }`
        )
        .setColor(getConfig(interaction).embedSettings.color)

    await channel.setRateLimitPerUser(slowmode)
    await interaction.reply({ embeds: [embed] })
}
