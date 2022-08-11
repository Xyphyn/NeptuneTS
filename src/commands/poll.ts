import {
    ActionRow,
    ActionRowBuilder,
    ActionRowData,
    APIEmbed,
    ApplicationCommandOptionType,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType
} from 'discord.js'
import { globalConfig } from '../config/globalConfig.js'
import { newPoll, polls } from '../tools/polltool.js'
import { Command } from '../types/types'

export const data: Command = {
    name: 'poll',
    description: 'Creates a poll.',
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'create',
            description: 'Creates a live poll.',
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'question',
                    description: 'The question for the poll.',
                    required: true
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'option1',
                    description: 'The first choice.',
                    required: true
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'option2',
                    description: 'The second choice.',
                    required: true
                }
            ]
        }
    ]
}

export const execute = async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply()
    const msg = await interaction.fetchReply()

    const question = interaction.options.getString('question')!
    const op1 = interaction.options.getString('option1')!
    const op2 = interaction.options.getString('option2')!

    const options = [op1, op2]

    newPoll(msg.id, options, question, msg)

    const row: ActionRowBuilder<any> = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel(options[0])
            .setCustomId(`op1-${options[0]}`)
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setLabel(options[1])
            .setCustomId(`op2-${options[1]}`)
            .setStyle(ButtonStyle.Primary)
    )

    const embed: APIEmbed = {
        title: `${question}`,
        description: `Expires <t:${Math.floor(Date.now() / 1000) + 43200}:R>`,
        fields: [
            {
                name: `${options[0]}`,
                value: `0`,
                inline: true
            },
            {
                name: `${options[1]}`,
                value: `0`,
                inline: true
            }
        ],
        color: globalConfig.embedColor,
        footer: {
            text: 'Polls expire to save resources. Contact Xylight for more info.'
        }
    }

    await interaction.editReply({
        embeds: [embed],
        components: [row]
    })
}
