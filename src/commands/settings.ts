import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandBuilder
} from 'discord.js'
import { getConfig, saveState } from '../config/config.js'

export const data = new SlashCommandBuilder()
    .setName('settings')
    .setDescription('[BETA] Simpler configuration.')
    .addSubcommandGroup((group) =>
        group
            .setName('moderation')
            .setDescription('Moderation settings.')
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('logging')
                    .setDescription('Logging channel.')
                    .addChannelOption((option) =>
                        option
                            .setName('channel')
                            .setDescription('The modlog channel.')
                            .setRequired(true)
                    )
            )
    )

export const permissions = PermissionFlagsBits.Administrator
export const permissionsString = 'Administrator'

export const execute = async (interaction: ChatInputCommandInteraction) => {
    switch (interaction.options.getSubcommandGroup()) {
        case 'moderation': {
            switch (interaction.options.getSubcommand()) {
                case 'logging': {
                    const channel = interaction.options.getChannel('channel')!

                    getConfig(interaction).logging.loggingChannel = channel.id
                    saveState()

                    break
                }
            }
            break
        }
    }

    const embeds = new EmbedBuilder()
        .setTitle('Set')
        .setDescription('Set config successfully.')
        .setColor(0xbd00ff)

    interaction.reply({
        embeds: [embeds]
    })
}
