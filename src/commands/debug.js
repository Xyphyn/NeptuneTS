import { SlashCommandBuilder } from "@discordjs/builders"
import { Permissions } from "discord.js"
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js"
import { config, loadState, saveState } from "../config/config.js"

export const data = new SlashCommandBuilder().setName("debug").setDescription("debug").addSubcommand(subcommand => subcommand.setName('save').setDescription('Saves config state to the database.')).addSubcommand(subcommand => subcommand.setName('load').setDescription('Loads config state from the database.'))

export const permissions = Permissions.FLAGS.ADMINISTRATOR

export const execute = async (interaction, client) => {
    const embed = new MessageEmbed().setTitle("Saving configs....")
    .setDescription(`<a:WindowsLoading:883414701218873376> Saving...`).setColor(config[interaction.guild.id].embedSettings.color)
    if (interaction.options.getSubcommand() === 'save') {
        await interaction.reply({
            embeds: [embed]
        })

        await saveState()
        embed.setTitle('Saved').setDescription(`<:WindowsSuccess:824380489712140359> Saved`)

        await interaction.editReply({
            embeds: [embed]
        })
    } else if (interaction.options.getSubcommand() === 'load') {
        embed.setTitle("Loading configs....").setDescription(`<a:WindowsLoading:883414701218873376> Loading configs...`).setColor(config[interaction.guild.id].embedSettings.color)

        await interaction.reply({
            embeds: [embed]
        })

        await loadState()

        embed.setTitle('Loaded').setDescription(`<:WindowsSuccess:824380489712140359> Loaded`)

        await interaction.editReply({
            embeds: [embed]
        })
    }
}