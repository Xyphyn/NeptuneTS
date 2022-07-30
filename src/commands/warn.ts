import {
    SlashCommandBuilder,
    EmbedBuilder,
    ChatInputCommandInteraction
} from 'discord.js'
import { dbConfig } from '../database/dbConfig.js'
import { insertToDatabase } from '../database/mongodb.js'
import { v4 as uuid } from 'uuid'
import { decidePunishment } from '../managers/punishmentManager.js'
import { logEmbed } from '../managers/logManager.js'
import { config, getConfig } from '../config/config.js'
import { noPermission } from '../managers/errorManager.js'
import { delay } from '../managers/util.js'
import { PermissionsBitField } from 'discord.js'
import { client } from '../app.js'

export const data = new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warning commands')
    .addUserOption((option) =>
        option
            .setName('user')
            .setDescription('The user to warn.')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('reason')
            .setDescription('The reason for the warning.')
            .setRequired(false)
    )

export const permissions = PermissionsBitField.Flags.ModerateMembers
export const permissionsString = 'Moderate Members'

export const execute = async (interaction: ChatInputCommandInteraction) => {
    const user = interaction.options.getUser('user')!
    const guild = interaction.guild!.id

    const reason = interaction.options.getString('reason')
    const moderator = interaction.user.id
    const time = new Date().getTime()

    if (user == client.user) {
        const huh = [
            'D- D- Did you just try having ***me*** warn ***__myself__***? :neutral_face:',
            'What the heck are you doing?',
            "You can't warn me!",
            'you want *me* to warn *me*?'
        ]

        const uhm = ['what... uh...', 'well this is awkward...', 'uhm', 'wat']

        const okay = ['whatever...', 'okay...?', 'why though?']

        await interaction.reply({
            content: huh[~~(Math.random() * huh.length)]
        })

        await delay(1000)
        await interaction.channel!.sendTyping()
        await delay(1000)
        await interaction.channel!.send(uhm[~~(Math.random() * uhm.length)])

        await interaction.channel!.sendTyping()
        await delay(1000)
        await interaction.channel!.send(okay[~~(Math.random() * okay.length)])

        await delay(1000)
        await interaction.channel!.sendTyping()
        await delay(500)
    }

    const data = {
        user: user.id,
        reason: reason,
        moderator: moderator,
        guild: guild,
        time: time,
        id: uuid()
    }

    insertToDatabase(dbConfig.warningCollection, data)

    const embed = new EmbedBuilder()
        .setColor(getConfig(interaction).embedSettings.color)
        .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
        .addFields([
            { name: 'Offending User', value: `<@${user.id}>`, inline: true },
            { name: 'Moderator', value: `<@${moderator}>`, inline: true },
            {
                name: 'Reason',
                value: reason ?? 'No reason specified.',
                inline: true
            }
        ])
        .setFooter({ text: `${data.id}` })

    logEmbed(embed, interaction.guild!, interaction)

    if (!interaction.replied) {
        await interaction.reply({
            content: `${getConfig(interaction).emojiSettings.warn} <@${
                user.id
            }> has been warned. **${
                interaction.options.getString('reason') ??
                'No reason specified.'
            }**`
        })
    } else {
        await interaction.channel!.send({
            content: `${getConfig(interaction).emojiSettings.warn} <@${
                user.id
            }> has been warned. **${
                interaction.options.getString('reason') ??
                'No reason specified.'
            }**`
        })
    }

    if (await decidePunishment(user, interaction.guild!, interaction)) {
        await interaction.channel!.send(
            `${getConfig(interaction).emojiSettings.mute} <@${
                user.id
            }> has been muted. **Automatic mute after ${
                getConfig(interaction).punishmentSettings.warningsUntilMute
            } warnings within ${
                getConfig(interaction).punishmentSettings.warningHours
            } hours.**`
        )

        embed
            .setColor(getConfig(interaction).embedSettings.errorColor)
            .setFields([
                {
                    name: 'Muted',
                    value: '**Automatic mute after multiple warnings within 24 hours.**'
                }
            ])

        logEmbed(embed, interaction.guild!, interaction)
    }
}
