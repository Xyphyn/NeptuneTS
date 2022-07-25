import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder
} from 'discord.js'
import { config, getColor, getConfig } from '../config/config.js'

export const data = new SlashCommandBuilder()
    .setName('utility')
    .setDescription('Utility commands')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('embed')
            .setDescription('Creates an embed.')
            .addStringOption((option) =>
                option
                    .setName('title')
                    .setDescription('The title of the embed.')
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('description')
                    .setDescription('The description of the embed.')
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('color')
                    .setDescription('The color of the embed.')
                    .setRequired(false)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('epoch')
            .setDescription('Gets the current unix timestamp.')
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('status')
            .setDescription('Sets the status of the bot')
            .addStringOption((option) =>
                option
                    .setName('status-type')
                    .setDescription('The type of status')
                    .setRequired(true)
                    .setChoices(
                        {
                            name: 'Competing',
                            value: 'COMPETING'
                        },
                        {
                            name: 'Listening',
                            value: 'LISTENING'
                        },
                        {
                            name: 'Watching',
                            value: 'WATCHING'
                        },
                        {
                            name: 'Streaming',
                            value: 'STREAMING'
                        },
                        {
                            name: 'Playing',
                            value: 'PLAYING'
                        }
                    )
            )
            .addStringOption((option) =>
                option
                    .setName('status-message')
                    .setDescription('The message to display')
                    .setRequired(true)
            )
    )

export const execute = async (
    interaction: ChatInputCommandInteraction,
    client: any
) => {
    const subcommand = interaction.options.getSubcommand()
    switch (subcommand) {
        case 'embed': {
            const title = interaction.options.getString('title')
            const description = interaction.options.getString('description')

            const hexRegex = '^#(([0-9a-fA-F]{2}){3}|([0-9a-fA-F]){3})$'
            const colorCheck = interaction.options.getString('color') ?? ''
            const color = colorCheck.match(hexRegex)
                ? colorCheck
                : getConfig(interaction).embedSettings.color

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(color)

            await interaction.reply({
                embeds: [embed]
            })

            break
        }
        case 'epoch': {
            const epoch = Math.floor(Date.now() / 1000)
            const embed = new EmbedBuilder()
                .setTitle(`Timestamp: \`${epoch}\``)
                .setDescription(`<t:${epoch}>`)
                .setColor('#2F3136')

            await interaction.reply({
                embeds: [embed]
            })

            break
        }
        case 'status': {
            const message = interaction.options.getString('status-message')
            const type = interaction.options.getString('status-type')

            await client.user.setActivity(message, { type: type })

            config.status = {
                message: message,
                type: type
            }

            const color = getColor(interaction)

            const embed = new EmbedBuilder()
                .setTitle(`Status set`)
                .setDescription(
                    `<:WindowsSuccess:977721596468928533> Status was set to \`${type} ${message}\``
                )
                .setColor(color)

            interaction.reply({
                embeds: [embed]
            })

            break
        }
    }
}
