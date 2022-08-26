import {
    ApplicationCommandOptionType,
    Attachment,
    AttachmentBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder
} from 'discord.js'
import { globalConfig } from '../config/globalConfig.js'
import { error } from '../managers/errorManager.js'
import { Command } from '../types/types'
import { loading } from '../util/tools.js'
import fs from 'fs'
import fetch from 'node-fetch'

export const data: Command = {
    name: 'neural',
    description: 'Neural network commands.',
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'digit',
            description: 'Digit recognition, from numbers 0-9',
            options: [
                {
                    type: ApplicationCommandOptionType.Attachment,
                    name: 'image',
                    description:
                        'The handwritten digit for the neural network to recognize.',
                    required: true
                }
            ]
        }
    ]
}

export const execute = async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply()
    const attachment = interaction.options.getAttachment('image')!
    const allowedTypes = ['png', 'jpg', 'jpeg', 'bmp']
    const attachmentType = attachment.url.split('.').slice(-1)[0]

    if (!allowedTypes.includes(attachmentType)) {
        await interaction.editReply({
            embeds: [error('Not a supported file type.')]
        })
    }

    let res: any
    try {
        res = await fetch('http://local.xylight.us:80/neural/digit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imgUrl: `${attachment.url}`,
                type: attachmentType
            })
        })
    } catch {
        await interaction.editReply({
            embeds: [error("Neptune's neural network servers are offline.")]
        })
        return
    }

    const json = await res!.json()

    const embed = new EmbedBuilder()
        .setImage(`${attachment.url}`)
        .setDescription(`The network thinks this is a ${json.guess}`)
        .setColor(globalConfig.embedColor)
        .setFooter({
            text: 'The network does best on centered, 1:1, grayscale images.'
        })

    await interaction.editReply({
        embeds: [embed]
    })
}
