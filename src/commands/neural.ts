import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    Attachment,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Interaction,
    MessageComponentInteraction
} from 'discord.js'
import { globalConfig } from '../config/globalConfig.js'
import { error } from '../managers/errorManager.js'
import { Command } from '../types/types'
import { loading } from '../util/tools.js'
import fs from 'fs'
import fetch from 'node-fetch'
import { v4 as uuid } from 'uuid'

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

    const downloadFile = async (url: string, path: string) => {
        const res = await fetch(url)
        const fileStream = fs.createWriteStream(path)
        await new Promise((resolve, reject) => {
            res.body!.pipe(fileStream)
            res.body!.on('error', reject)
            fileStream.on('finish', resolve)
        })
    }

    const res = await fetch(
        `http://${process.env.NEURAL_SERVER}${urls[subcommand]}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imgUrl: `${attachment.url}`,
                type: attachmentType
            })
        }
    ).catch(async (e) => {
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
            const rows: any = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('np-neural-incorrect')
                    .setStyle(ButtonStyle.Danger)
                    .setLabel('Incorrect'),
                new ButtonBuilder()
                    .setCustomId('np-neural-correct')
                    .setStyle(ButtonStyle.Success)
                    .setLabel('Correct')
            )

            const embed = new EmbedBuilder()
                .setImage(`${attachment.url}`)
                .setDescription(`The model thinks this is a ${json.guess}`)
                .setColor(globalConfig.embedColor)
                .setFooter({
                    text: 'This model does best on centered, 1:1 images of cats and dogs.'
                })

            const collector =
                interaction.channel!.createMessageComponentCollector({
                    idle: 30000,
                    filter: (i: Interaction) => {
                        return i.user == interaction.user
                    }
                })

            collector.on(
                'collect',
                async (cmpInteraction: MessageComponentInteraction) => {
                    if (!cmpInteraction.isButton()) return
                    if (!fs.existsSync('data')) {
                        fs.mkdirSync('data')
                    }
                    if (!fs.existsSync('data/cat')) {
                        fs.mkdirSync('data/cat')
                    }
                    if (!fs.existsSync('data/dog')) {
                        fs.mkdirSync('data/dog')
                    }
                    if (cmpInteraction.customId == 'np-neural-incorrect') {
                        let dir = `data/${json.guess}`
                        if (json.guess == 'cat') dir = 'data/dog'
                        else dir = 'data/cat'

                        downloadFile(
                            attachment.url,
                            `${dir}/${uuid()}.${attachmentType}`
                        )
                    }
                    if (cmpInteraction.customId == 'np-neural-correct') {
                        let dir = `data/${json.guess}`
                        if (json.guess == 'cat') dir = 'data/cat'
                        else dir = 'data/dog'

                        downloadFile(
                            attachment.url,
                            `${dir}/${uuid()}.${attachmentType}`
                        )
                    }

                    await cmpInteraction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('Submitted')
                                .setDescription(
                                    "Thanks for helping Neptune's neural network get better! Note that abuse can get you permanently banned from using Neptune."
                                )
                                .setColor(globalConfig.embedColor)
                        ],
                        ephemeral: true
                    })

                    collector.stop()
                }
            )

            await interaction.editReply({
                embeds: [embed],
                components: [rows]
            })

            break
        }
    }
}
