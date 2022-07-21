import { PermissionsBitField } from 'discord.js'
import { PermissionFlagsBits } from 'discord.js'
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { config, getConfig } from '../config/config.js'
import { logEmbed } from '../managers/logManager.js'

export const data = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans a user')
    .addUserOption((option) =>
        option
            .setName('user')
            .setDescription('The user to ban.')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('reason')
            .setDescription('The reason for the ban.')
            .setRequired(true)
    )

export const permissions = PermissionFlagsBits.BanMembers
export const permissionsString = 'Ban Members'

export const execute = async (interaction, client) => {
    const user = interaction.options.getUser('user')
    const guildMember = await interaction.guild.members.fetch(user.id)
    const reason = interaction.options.getString('reason')
    const moderator = interaction.user.id

    const embed = new EmbedBuilder()
        .setColor(getConfig(interaction).embedSettings.color)
        .setAuthor({ name: user.username, iconURL: user.avatarURL() })
        .setDescription('Ban')
        .addFields([
            { name: 'Offending User', value: `<@${user.id}>`, inline: true },
            { name: 'Moderator', value: `<@${moderator}>`, inline: true },
            {
                name: 'Reason',
                value: reason ?? 'No reason specified.',
                inline: true
            }
        ])

    if (guildMember.bannable) {
        guildMember.ban({
            deleteMessageDays: 0,
            reason: reason ?? 'No reason specified.'
        })
    } else {
        const embed2 = new EmbedBuilder()
            .setColor(getConfig(interaction).embedSettings.errorColor)
            .setTitle('Ban failed')
            .setDescription(
                `<:WindowsCritical:824380490051747840> Failed to ban <@${user.id}>. They probably are an admin/moderator.`
            )
        await interaction.reply({
            embeds: [embed2]
        })
        return
    }

    logEmbed(embed, interaction.guild)

    await interaction.reply({
        content: `${getConfig(interaction).emojiSettings.ban} <@${
            user.id
        }> has been banned. **${
            interaction.options.getString('reason') ?? 'No reason specified.'
        }**`
    })
}
