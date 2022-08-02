import {
    APIEmbed,
    ApplicationCommandOptionType,
    ChatInputApplicationCommandData,
    ChatInputCommandInteraction,
    Embed,
    EmbedData
} from 'discord.js'
import { reminders } from '../tools/remindmetool.js'
import ms from 'ms'
import { error } from '../managers/errorManager.js'
import { globalConfig } from '../config/globalConfig.js'
import { Command } from '../types/types'

export const data: Command = {
    name: 'remindme',
    description: 'Reminds you about something',
    options: [
        {
            name: 'reminder',
            description: 'What you want to be reminded about',
            required: true,
            type: ApplicationCommandOptionType.String
        },
        {
            name: 'time',
            description: 'When you want to be reminded',
            required: true,
            type: ApplicationCommandOptionType.String
        }
    ]
}

export const execute = async (interaction: ChatInputCommandInteraction) => {
    const reminder = interaction.options.getString('reminder')!
    const time = interaction.options.getString('time')!
    const parsed = ms(time)

    if (!parsed) {
        await interaction.reply({
            embeds: [
                error(
                    'Invalid time. Usage: /remindme <reminder> 50**s**, **m**, **h**, etc'
                )
            ]
        })
        return
    }

    const embed: APIEmbed = {
        title: 'Set',
        description: `${
            globalConfig.successEmoji
        } I'll try to remind you about that <t:${Math.ceil(
            (Date.now() + parsed) / 1000
        )}:R>`,
        color: globalConfig.embedColor
    }

    reminders.set(interaction.id, {
        reminder: reminder,
        user: interaction.user
    })

    interaction.reply({ embeds: [embed] })

    setTimeout(async () => {
        const embed: APIEmbed = {
            title: 'Reminder',
            description: `You asked to be reminded about this.`,
            fields: [
                {
                    name: 'Reminder',
                    value: `${reminder}`,
                    inline: false
                }
            ],
            color: globalConfig.embedColor
        }

        await interaction.channel!.send({
            content: `<@${interaction.user.id}>`,
            embeds: [embed]
        })
    }, parsed)
}
