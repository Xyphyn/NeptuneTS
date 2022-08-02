import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder
} from 'discord.js'
import { config, getConfig } from '../config/config.js'
import { dbConfig } from '../database/dbConfig.js'
import { findInDatabase } from '../database/mongodb.js'

export const data = new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Gets warnings for a user')
    .setDMPermission(false)
    .addUserOption((option) =>
        option
            .setName('user')
            .setDescription('The user to view the warnings of.')
            .setRequired(true)
    )
    .addBooleanOption((option) =>
        option
            .setName('private')
            .setDescription(
                'Sets if it should be private or not. (Default true)'
            )
            .setRequired(false)
    )
    .addBooleanOption((option) =>
        option
            .setName('show-id')
            .setDescription(
                'Sets if the warning ID should be shown or not. (Default false)'
            )
            .setRequired(false)
    )

export const execute = async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply({
        ephemeral: interaction.options.getBoolean('private') ?? true
    })

    const user = interaction.options.getUser('user')!
    const guild = interaction.guild!.id

    const data = {
        user: user.id,
        guild: guild
    }

    const warnings = await findInDatabase(
        dbConfig.warningCollection,
        data
    ).toArray()

    let warningString = ''
    warnings.forEach((warning: any) => {
        warningString += `<t:${Math.floor(warning.time / 1000)}:R> **${
            warning.reason
        }** ${interaction.options.getBoolean('show-id') ? warning.id : ''}\n`
    })

    let color = getConfig(interaction).embedSettings.color

    if (warningString === '') {
        warningString = 'No warnings found.'
        color = getConfig(interaction).embedSettings.successColor
    }

    const embed = new EmbedBuilder()
        .setColor(color)
        .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
        .setTitle('Warnings')
        .setDescription(warningString)

    await interaction.editReply({
        embeds: [embed]
    })
}
