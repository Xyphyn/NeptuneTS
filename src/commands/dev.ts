import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder
} from 'discord.js'
import { loadState } from '../config/config.js'
import os from 'os'
import { PermissionsBitField } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('dev')
    .setDescription('Developer commands')
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
        subcommand
            .setName('sync')
            .setDescription('Refreshes config from database')
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('resources')
            .setDescription('Resource usage of the bot')
    )
    .addSubcommand((subcommand) =>
        subcommand.setName('stop').setDescription('Stops the bot.')
    )

export const permissions = PermissionsBitField.Flags.SendMessages
export const permissionsString = 'Send Messages'

export const execute = async (interaction: ChatInputCommandInteraction) => {
    if (!(interaction.user.id == '735626570399481878')) {
        const embed = new EmbedBuilder()
            .setTitle('Error')
            .setDescription(
                '<:WindowsShieldUAC:999005696483926017> This command is only available for developers.'
            )
            .setColor(0xff0000)
        interaction.reply({
            embeds: [embed]
        })
        return
    }

    const embed = new EmbedBuilder()

    switch (interaction.options.getSubcommand()) {
        case 'sync': {
            embed
                .setTitle('Synced')
                .setDescription(
                    '<:WindowsSuccess:977721596468928533> Done. Synced config with database.'
                )
                .setColor('#5865f2')

            await loadState()

            interaction.reply({
                embeds: [embed]
            })

            break
        }
        case 'resources': {
            embed
                .setTitle('<:system:998732644575621201> Resources')
                .setDescription(
                    `<:cpu:998732645187997748> CPU | ${os.loadavg()[0]}%
                <:memory:998732647847182366> Memory | ${Math.round(
                    process.memoryUsage().rss / 1000000
                )} MB \`${Math.round(
                        (process.memoryUsage().rss / 512000000) * 100
                    )}%\``
                )
                .setColor('#5865f2')

            interaction.reply({
                embeds: [embed]
            })

            break
        }
        case 'stop': {
            embed
                .setTitle('Bot stopping.')
                .setDescription('Stopping bot. It will restart shortly.')
                .setColor('#5865f2')

            await interaction.reply({
                embeds: [embed]
            })

            process.exit(0)
        }
    }
}
