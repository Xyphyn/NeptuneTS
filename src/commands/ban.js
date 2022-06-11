import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js"
import { config } from '../config/config.js'
import ms from "ms"
import { logEmbed } from "../managers/logManager.js"
import { Permissions } from "discord.js"

export const data = new SlashCommandBuilder().setName("ban").setDescription("Bans a user").addUserOption(option => option.setName('user').setDescription('The user to ban.').setRequired(true)).addStringOption(option => option.setName('reason').setDescription('The reason for the ban.').setRequired(true))

export const permissions = 'BAN_MEMBERS'

export const execute = async (interaction, client) => {
    const user = await interaction.options.getUser('user')
    const reason = await interaction.options.getString('reason')
    const moderator = await interaction.user.id

    const embed = new MessageEmbed().setColor(config[interaction.guild.id].embedSettings.embedColor).setAuthor({ name: user.username, iconURL: user.displayAvatarURL() }).setDescription('Ban').addField('Offending User', `<@${user.id}>`, true).addField('Moderator', `<@${moderator}>`, true).addField('Reason', reason ?? 'No reason specified.', true)

    if (user.bannable) {
        interaction.guild.members.cache.get(user.id).ban({
            days: 0, reason: reason ?? 'No reason specified.'
        })
    } else {
        const embed2 = new MessageEmbed().setColor(config[interaction.guild.id].embedSettings.errorColor).setTitle('Ban failed').setDescription(`<:WindowsCritical:824380490051747840> Failed to ban <@${user.id}>. Ya sure they can be banned?`)
        await interaction.reply({
            embeds: [ embed2 ]
        })
        return
    }

    logEmbed(embed)

    await interaction.reply({
        content: `${config[interaction.guild.id].emojiSettings.ban} <@${interaction.options.getUser('user').id}> has been banned. **${interaction.options.getString('reason') ?? 'No reason specified.'}**`,
    })
}