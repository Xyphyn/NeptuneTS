import { PermissionsBitField } from 'discord.js'
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { config } from '../config/config.js'
import { dbConfig } from '../database/dbConfig.js'
import { deleteFromDatabase } from '../database/mongodb.js'
import { noPermission } from '../managers/errorManager.js'
import { logEmbed } from '../managers/logManager.js'

export const data = new SlashCommandBuilder()
    .setName('delwarn')
    .setDescription('Deletes a warning')
    .addStringOption((option) =>
        option
            .setName('uuid')
            .setDescription('The uuid of the warning to delete.')
            .setRequired(true)
    )

export const execute = async (interaction, client) => {
    if (
        !interaction.member.permissions.has(
            PermissionsBitField.Flags.ModerateMembers
        )
    ) {
        interaction.reply({
            embeds: [noPermission('Moderate Members')]
        })
        return
    }

    const uuid = await interaction.options.getString('uuid')
    deleteFromDatabase(dbConfig.warningCollection, { id: uuid })
    const embed = new EmbedBuilder()
        .setColor(config[interaction.guild.id].embedSettings.errorColor)
        .addFields([
            { name: 'Warning deleted', value: `${uuid}`, inline: true },
            {
                name: 'Moderator',
                value: `<@${interaction.user.id}>`,
                inline: true
            }
        ])
    const embed2 = new EmbedBuilder()
        .setColor(config[interaction.guild.id].embedSettings.errorColor)
        .setTitle('Warning deleted')
        .setDescription(
            `<:WindowsRecycleBin:824380487920910348> Warning of UUID \`${uuid}\` has been deleted.`
        )

    logEmbed(embed2, interaction.guild)
    await interaction.reply({
        embeds: [embed2]
    })
}
