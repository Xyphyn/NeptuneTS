import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageEmbed } from "discord.js"
import { config } from "../config/config.js"

export const data = new SlashCommandBuilder()
    .setName('utility')
    .setDescription('Utility commands')
    .addSubcommand(subcommand => subcommand
        .setName('embed')
        .setDescription('Creates an embed.')
        .addStringOption(option => option
            .setName('title')
            .setDescription('The title of the embed.')
            .setRequired(true)    
        )
        .addStringOption(option => option
            .setName('description')
            .setDescription('The description of the embed.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('color')
            .setDescription('The color of the embed.')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand => subcommand
        .setName('epoch')
        .setDescription('Gets the current unix timestamp.')
    )

export const execute = async (interaction, client) => {
    const subcommand = interaction.options.getSubcommand()
    switch (subcommand) {
        case 'embed': {
            const title = interaction.options.getString('title')
            const description = interaction.options.getString('description')

            const hexRegex = '^#(([0-9a-fA-F]{2}){3}|([0-9a-fA-F]){3})$'
            const colorCheck = interaction.options.getString('color') ?? ''
            const color = colorCheck.match(hexRegex) ? colorCheck : config[interaction.guild.id].embedSettings.color

            const embed = new MessageEmbed()
                .setTitle(title)
                .setDescription(description)
                .setColor(color)

            await interaction.reply({
                embeds: [embed],
            })

            break
        }
        case 'epoch': {
            const epoch = Math.floor(Date.now() / 1000)
            const embed = new MessageEmbed()
                .setTitle(`Timestamp: \`${epoch}\``)
                .setDescription(`<t:${epoch}>`)
                .setColor('#2F3136')

            await interaction.reply({
                embeds: [embed],
            })
        }
    }
}