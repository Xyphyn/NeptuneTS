import { SlashCommandBuilder } from "@discordjs/builders";
import { Permissions } from "discord.js";
import { loggingClient } from "../managers/logManager.js";

export const data = new SlashCommandBuilder()
    .setName('status')
    .setDescription('Sets the status of the bot (commits mass murder)')
    .addStringOption(option =>
        option.setName('status-type')
            .setDescription('The type of status')
            .setRequired(true)
            .setChoices({
                name: 'Competing',
                value: 'COMPETING'
            }, {
                name: 'Listening',
                value: 'LISTENING'
            }, {
                name: 'Watching',
                value: 'WATCHING'
            }, {
                name: 'Streaming',
                value: 'STREAMING'
            }, {
                name: 'Playing',
                value: 'PLAYING'
            })
    )
    .addStringOption(option => 
        option.setName('status-message')
            .setDescription('The message to display')
            .setRequired(true)
    )

export const permissions = Permissions.FLAGS.SEND_MESSAGES

export const execute = async (interaction, client) => {
    await loggingClient.user.setActivity(interaction.options.getString('status-message'), { type: interaction.options.getString('status-type') })
    interaction.reply({
        content: `Status set to... ${interaction.options.getString('status-type').toLowerCase()} ${interaction.options.getString('status-message')}. Wat`
    })
}