import { SlashCommandBuilder } from "@discordjs/builders";
import { Permissions } from "discord.js";
import { MessageEmbed } from "discord.js";
import { config } from "../config/config.js";
import { embedSettings } from "../config/embeds.js";
import { dbConfig } from "../database/dbConfig.js";
import { findInDatabase } from "../database/mongodb.js";

export const data = new SlashCommandBuilder().setName("warnings").setDescription("Gets warnings for a user").addUserOption(option => option.setName('user').setDescription('The user to view the warnings of.').setRequired(true)).addBooleanOption(option => option.setName('private').setDescription('Sets if it should be private or not. (Default true)').setRequired(false)).addBooleanOption(option => option.setName('show-id').setDescription('Sets if the warning ID should be shown or not. (Default false)').setRequired(false))

export const execute = async (interaction, client) => {
    await interaction.deferReply({ ephemeral: interaction.options.getBoolean('private') ?? true });

    const user = await interaction.options.getUser('user')
    const guild = await interaction.guild.id

    const data = {
        user: user.id,
        guild: guild,
    }

    const warnings = await findInDatabase(dbConfig.warningCollection, data).toArray()

    let warningString = ''
    warnings.forEach(warning => {
        warningString += (`<t:${Math.floor(warning.time / 1000)}:R> **${warning.reason}** ${interaction.options.getBoolean('show-id') ? warning.id : ''}\n`)
    })

    let color = config[interaction.guild.id].embedSettings.color

    if (warningString === '') {
        warningString = 'No warnings found.'
        color = config[interaction.guild.id].embedSettings.successColor
    }

    const embed = new MessageEmbed().setColor(color).setAuthor({ name: user.username, iconURL: user.displayAvatarURL() }).setTitle('Warnings').setDescription(warningString)

    await interaction.editReply({
        embeds: [embed],
        ephemeral: interaction.options.getBoolean('private') ?? true,
    })
}