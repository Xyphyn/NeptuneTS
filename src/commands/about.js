import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';

export const data = new SlashCommandBuilder().setName('about').setDescription('About this bot!');

export const permissions = 0;

export const execute = async (interaction, client) => {
    const embed = new MessageEmbed()
    .setColor('BLURPLE')
    .setTitle('About')
    .setDescription(`
    Hey! This bot is a work in progress. It's made by Xylight#0001, and can work multi-server and has many useful moderation commands, as well as configs.
    If you see a bug, feel free to tell it to me.`)
    
    await interaction.reply({
        embeds: [ embed ]
    })
}