import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js"
import { config } from "../config/config.js"
import ms from "ms"
import { logEmbed } from "../managers/logManager.js"
import { Permissions } from "discord.js"
import { emojiSettings } from "../config/emojis.js"

export const data = new SlashCommandBuilder().setName("mute").setDescription("Times out a user").addUserOption(option => option.setName('user').setDescription('The user to timeout.').setRequired(true)).addStringOption(option => option.setName('reason').setDescription('The reason for the timeout.').setRequired(true)).addStringOption(option => option.setName('duration').setDescription('The duration of the timeout.').setRequired(true))

export const permissions = Permissions.FLAGS.MANAGE_MESSAGES

export const execute = async (interaction, client) => {
    const user = await interaction.options.getUser('user')
    const reason = await interaction.options.getString('reason')
    const duration = await interaction.options.getString('duration')
    const moderator = await interaction.user.id

    const embed = new MessageEmbed().setColor(config[interaction.guild.id].embedSettings.errorColor).setAuthor({ name: user.username, iconURL: user.displayAvatarURL() }).setDescription('Timeout').addField('Offending User', `<@${user.id}>`, true).addField('Moderator', `<@${moderator}>`, true).addField('Reason', reason ?? 'No reason specified.', true)

    const time = ms(duration) ?? ms('1h')
    interaction.guild.members.cache.get(user.id).timeout(time)

    logEmbed(embed)

    await interaction.reply({
        content: `${config[interaction.guild.id].emojiSettings.mute} <@${interaction.options.getUser('user').id}> has been muted. **${interaction.options.getString('reason') ?? 'No reason specified.'}**`,
    })
}