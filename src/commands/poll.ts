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
import { delPoll, newPoll, polls } from '../tools/polltool.js'
import { Command } from '../types/types'
import ms from 'ms'
import { getConfig } from '../config/config.js'
import { error } from '../managers/errorManager.js'
import { clamp } from '../util/tools.js'

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
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'option3',
                    description: 'The third choice.'
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'option4',
                    description: 'The fourth choice.'
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'option5',
                    description: 'The fifth choice.'
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'expiry',
                    description: 'Expiration date.'
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
    const op3 = interaction.options.getString('option3')!
    const op4 = interaction.options.getString('option4')!
    const op5 = interaction.options.getString('option5')!

    if (!getConfig(interaction).premium) {
        await interaction.editReply({
            embeds: [
                error(
                    'Custom expiration times are restricted to premium servers.'
                )
            ]
        })

        return
    }

    const expire = clamp(
        ms(interaction.options.getString('expiry') || '12h') || 43200000,
        5000,
        604800000
    )

    const options = [op1, op2, op3, op4, op5].filter(
        (option) => option != undefined
    )

    if (
        options.filter((val, index) => index != options.indexOf(val)).length > 0
    ) {
        await interaction.editReply({
            content: 'You cannot have duplicate choices.'
        })
        return
    }

    newPoll(msg.id, options, question, msg, expire)

    const row: ActionRowBuilder<any> = new ActionRowBuilder().addComponents(
        options.map((option) =>
            new ButtonBuilder()
                .setLabel(option)
                .setCustomId(`pollop-${option}`)
                .setStyle(ButtonStyle.Primary)
        )
    )

    const embed: APIEmbed = {
        title: `${question}`,
        description: `Expires <t:${Math.floor(
            Date.now() / 1000 + expire / 1000
        )}:R>`,
        fields: options.map((option) => ({
            name: `${option}`,
            value: '0',
            inline: true
        })),
        color: globalConfig.embedColor,
        footer: {
            text: 'Polls expire to save resources. Contact Xylight for more info.'
        }
    }

    const expiry = setTimeout(() => {
        delPoll(msg.id)
    }, expire)

    await interaction.editReply({
        embeds: [embed],
        components: [row]
    })
}
