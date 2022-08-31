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
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'catdog',
            description: 'Model that can distinguish between cats and dogs.',
            options: [
                {
                    type: ApplicationCommandOptionType.Attachment,
                    name: 'image',
                    description: 'The pet for the network to recognize.',
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
    const subcommand = interaction.options.getSubcommand()

    if (!allowedTypes.includes(attachmentType)) {
        await interaction.editReply({
            embeds: [error('Not a supported file type.')]
        })

        return
    }

    const urls: any = {
        digit: '/neural/digit',
        catdog: '/neural/catdog'
    }

    const res = await fetch(`http://local.xylight.us:80${urls[subcommand]}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            imgUrl: `${attachment.url}`,
            type: attachmentType
        })
    }).catch(async (e) => {
        await interaction.editReply({
            embeds: [
                error("Neptune's neural network servers are currently offline.")
            ]
        })
        return
    })

    const json: any = await res!.json()

    switch (subcommand) {
        case 'digit': {
            const embed = new EmbedBuilder()
                .setImage(`${attachment.url}`)
                .setDescription(
                    `The network thinks this is a${
                        json.guess == '8' ? 'n' : ''
                    } ${json.guess}`
                )
                .setColor(globalConfig.embedColor)
                .setFooter({
                    text: 'This model does best on images with black/transparent backgrounds.'
                })

            await interaction.editReply({
                embeds: [embed]
            })
            break
        }
        case 'catdog': {
        }
    }
}
