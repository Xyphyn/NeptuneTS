import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageEmbed } from "discord.js";
import { Permissions } from "discord.js"
import { config, saveState } from "../config/config.js";

export const data = new SlashCommandBuilder()
    .setName("config")
    .setDescription("Config commands.")
    .addSubcommand(subcommand => subcommand
        .setName('set')
        .setDescription('Sets a config value.')
        .addStringOption(option => option
            .setName('key')
            .setDescription('The key of the config value to set.')
            .setRequired(true))
        .addStringOption(option => option
            .setName('value')
            .setDescription('The value to set the config value to.')
            .setRequired(true)))

export const permissions = 'ADMINISTRATOR'

function leaf(obj, path, value) {
    const pList = path.split('.');
    const key = pList.pop(); 
    const pointer = pList.reduce((accumulator, currentValue) => {
      if (accumulator[currentValue] === undefined) accumulator[currentValue] = {};
      return accumulator[currentValue];
    }, obj);
    if (pointer[key] != undefined) {
        pointer[key] = value;
        return obj;
    } else return false
}

export const execute = async (interaction, client) => {
    const embed = new MessageEmbed().setTitle("Setting configs....")
    .setDescription(`<a:WindowsLoading:883414701218873376> Setting configs...`).setColor(config[interaction.guild.id].embedSettings.color)
    if (interaction.options.getSubcommand() === 'set') {
        await interaction.reply({
            embeds: [embed]
        })

        const key = interaction.options.getString('key')
        const value = interaction.options.getString('value')

        const result = leaf(config[interaction.guild.id], key, value)

        await saveState()

        embed.setTitle('Set').setDescription(`<:WindowsSuccess:824380489712140359> Set ${key} to ${value}`)

        if (!result) {
            embed.setTitle('Failed').setDescription(`<:WindowsCritical:824380490051747840> Failed to set ${key} to ${value}`)
        }

        await interaction.editReply({
            embeds: [embed]
        })
    }
}