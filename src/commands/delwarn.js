import { SlashCommandBuilder } from "@discordjs/builders"
import { Permissions } from "discord.js"
import { dbConfig } from "../database/dbConfig.js"
import { deleteFromDatabase, insertToDatabase } from "../database/mongodb.js"
import { config } from "../config/config.js"
import { MessageEmbed } from "discord.js"
import { embedSettings } from "../config/embeds.js"
import { logEmbed } from "../managers/logManager.js"

export const data = new SlashCommandBuilder().setName("delwarn").setDescription("Deletes a warning").addStringOption(option => option.setName('uuid').setDescription('The warning UUID (found in modlogs)').setRequired(true))

export const permissions = Permissions.FLAGS.BAN_MEMBERS

export const execute = async (interaction, client) => {
    await interaction.deferReply();
    const uuid = await interaction.options.getString('uuid')

    deleteFromDatabase(dbConfig.warningCollection, { id: uuid })

    const embed = new MessageEmbed().setColor(config[interaction.guild.id].embedSettings.errorColor).addField('Warning deleted', `${uuid}`, true).addField('Moderator', `<@${interaction.user.id}>`, true)
    const embed2 = new MessageEmbed().setColor(config[interaction.guild.id].embedSettings.errorColor).setTitle('Warning deleted').setDescription(`<:WindowsRecycleBin:824380487920910348> Warning of UUID \`${uuid}\` has been deleted.`)

    await logEmbed(embed2)

    await interaction.editReply({
        embeds: [embed2]
    })
}