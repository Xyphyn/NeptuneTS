import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { config } from '../config/config.js'
import ms from 'ms'
import { logEmbed } from '../managers/logManager.js'
import { DiscordAPIError } from 'discord.js'
import { PermissionsBitField } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Times out a user')
    .addUserOption((option) =>
        option
            .setName('user')
            .setDescription('The user to timeout.')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('reason')
            .setDescription('The reason for the timeout.')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('duration')
            .setDescription('The duration of the timeout.')
            .setRequired(true)
    )

export const permissions = PermissionsBitField.Flags.ModerateMembers
export const permissionsString = 'Moderate Members'

export const execute = async (interaction, client) => {
    const user = await interaction.options.getUser('user')
    const reason = await interaction.options.getString('reason')
    const duration = await interaction.options.getString('duration')
    const moderator = await interaction.user.id

    const embed = new EmbedBuilder()
        .setColor(config[interaction.guild.id].embedSettings.errorColor)
        .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
        .setDescription('Timeout')
        .addFields([
            { name: 'Offending User', value: `<@${user.id}>`, inline: true },
            { name: 'Moderator', value: `<@${moderator}>`, inline: true },
            {
                name: 'Reason',
                value: reason ?? 'No reason specified.',
                inline: true
            }
        ])

    const time = ms(duration) ?? ms('1h')

    const member = await interaction.guild.members.cache.get(user.id)
    await member.timeout(time)

    logEmbed(embed, interaction.guild)

    await interaction.reply({
        content: `${config[interaction.guild.id].emojiSettings.mute} <@${
            interaction.options.getUser('user').id
        }> has been muted. **${
            interaction.options.getString('reason') ?? 'No reason specified.'
        }**`
    })
}
