import { SlashCommandBuilder } from "@discordjs/builders"
import { Permissions } from "discord.js"
import { MessageEmbed } from "discord.js"
import { config } from "../config/config.js"
import { dbConfig } from "../database/dbConfig.js"
import { deleteFromDatabase } from "../database/mongodb.js"
import { noPermission } from "../managers/errorManager.js"
import { logEmbed } from "../managers/logManager.js"

export const data = new SlashCommandBuilder()
    .setName("delwarn")
    .setDescription("Deletes a warning")
    .addStringOption(option => option
        .setName('uuid')
        .setDescription('The uuid of the warning to delete.')
        .setRequired(true))

export const execute = async (interaction, client) => {
    if (!interaction.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
        interaction.reply({
            embeds: [ noPermission('BAN_MEMBERS') ]
        })
        return
    }
    
    const uuid = await interaction.options.getString('uuid')
    deleteFromDatabase(dbConfig.warningCollection, { id: uuid })
    const embed = new MessageEmbed().setColor(config[interaction.guild.id].embedSettings.errorColor).addField('Warning deleted', `${uuid}`,true).addField('Moderator', `<@${interaction.user.id}>`, true)
    const embed2 = new MessageEmbed().setColor(config[interaction.guild.id].embedSettings.errorColor).setTitle('Warning deleted').setDescription(`<:WindowsRecycleBin:824380487920910348> Warning of UUID \`${uuid}\` has been deleted.`)

    logEmbed(embed2, interaction.guild)
    await interaction.reply({
        embeds: [embed2]
    })
}