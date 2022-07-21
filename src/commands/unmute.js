import { PermissionsBitField } from 'discord.js'
import { SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmutes a user')
    .addUserOption((option) =>
        option
            .setName('user')
            .setDescription('The user to timeout.')
            .setRequired(true)
    )

export const permissions = PermissionsBitField.Flags.ModerateMembers
export const permissionsString = 'Moderate Members'

export const execute = async (interaction, client) => {
    const user = await interaction.options.getUser('user')

    const member = await interaction.guild.members.cache.get(user.id)
    await member.timeout(null)

    await interaction.reply({
        content: `<:WindowsSuccess:824380489712140359> <@${
            interaction.options.getUser('user').id
        }> has been unmuted.`
    })
}
