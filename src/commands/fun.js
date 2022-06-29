import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { config } from "../config/config.js";
import fetch from 'node-fetch'
import { MessageActionRow } from "discord.js";
import { MessageButton } from "discord.js";
import { Collector } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName('fun')
    .setDescription('Fun commands')
    .addSubcommand(subcommand => subcommand
        .setName('fact')
        .setDescription('Get a random fact!')
    )
    .addSubcommand(subcommand => subcommand
        .setName('coinflip')
        .setDescription('Flips a coin. Why not?')
    )
    .addSubcommand(subcommand => subcommand
        .setName('cat')
        .setDescription('Gets a picture of a cute kitty.')
        .addBooleanOption(option => option
            .setName('animated')
            .setDescription('Gets an animated cat.')
        )
    )

export const execute = async (interaction) => {
    switch (interaction.options.getSubcommand()) {
        case 'fact': {
            await interaction.deferReply()
            const res = await fetch('https://uselessfacts.jsph.pl/random.json?language=en')
            const json = await res.json()
            const embed = new MessageEmbed()
                .setTitle('Useless Fact')
                .setDescription(`${json.text} ${['🤔', '🤯', '😮'][Math.floor(3 * Math.random())]}`)
                .setURL(json.source_url)
                .setColor(config[interaction.guild.id].embedSettings.color)

            await interaction.editReply({
                embeds: [embed],
            })

            break
        }
        case 'coinflip': {
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('coinflip-heads')
                        .setLabel('Heads 👨')
                        .setStyle('SECONDARY'),
                    new MessageButton()
                        .setCustomId('coinflip-tails')
                        .setLabel('Tails 🐒')
                        .setStyle('SECONDARY')
                )
            const embed = new MessageEmbed()
                .setTitle('Heads or tails?')
                .setDescription(`The decision is yours. Choose wisely.`)
                .setFooter({ text: 'You have 30 seconds to decide.' })
                .setColor(config[interaction.guild.id].embedSettings.color)

            const message = await interaction.reply({
                embeds: [embed],
                components: [row]
            })

            const collector = interaction.channel.createMessageComponentCollector({
                filter: (int) => { try { return int.message.id === message.id } catch (e) { return true }},
                time: 30000
            })

            collector.on('collect', btnInt => {
                const decision = (btnInt.customId === 'coinflip-heads') ? 'Heads' : 'Tails'
                const response = ['Heads', 'Tails'][Math.floor(2 * Math.random())]
                const win = decision === response

                btnInt.deferUpdate()

                embed
                    .setTitle(`${response}!`)
                    .setDescription(win ? `You won! 🥳` : `You lost! ☹️`)
                    .setFooter({ text: '' })

                interaction.editReply({
                    embeds: [embed],
                    components: []
                })

                collector.stop()
            })

            break
        }
        case 'cat': {
            const message = await interaction.deferReply()
            const animated = interaction.options.getBoolean('animated')
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('cat-another')
                        .setLabel('Another! 🔄️')
                        .setStyle('SECONDARY')
                )

            const getCat = async () => {
                const res = await fetch(`https://api.thecatapi.com/v1/images/search${animated ? '?mime_types=gif' : ''}`)
                const json = await res.json()

                const embed = new MessageEmbed()
                    .setTitle(`Kitty ${['😺', '😸', '😹', '😻'][Math.floor(4 * Math.random())]}`)
                    .setImage(json[0].url)
                    .setColor(config[interaction.guild.id].embedSettings.color)

                await interaction.editReply({
                    embeds: [embed],
                    components: [row]
                })
            }

            getCat()

            const collector = interaction.channel.createMessageComponentCollector({
                filter: (int) => { try { return int.message.id === message.id } catch (e) { return true }},
                time: 900000
            })

            collector.on('collect', btnInt => {
                if (btnInt.customId === 'cat-another') {
                    getCat()
                }
                btnInt.deferUpdate()
            })
        }
    }    
} 