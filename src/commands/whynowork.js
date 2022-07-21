import { SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('image-test')
    .setDescription('bruih')

export const execute = async (interaction) => {
    console.log('cool')
}
