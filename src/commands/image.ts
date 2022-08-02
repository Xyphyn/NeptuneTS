import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder
} from 'discord.js'
import { loading } from '../util/tools.js'
import { loadImage, Canvas } from 'skia-canvas'
import fs from 'fs'

export const data = new SlashCommandBuilder()
    .setName('image')
    .setDescription('Image manipulation commands')
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
        subcommand
            .setName('resize')
            .setDescription('Resizes an image')
            .addAttachmentOption((option) =>
                option
                    .setName('image')
                    .setDescription('The image to resize')
                    .setRequired(true)
            )
            .addIntegerOption((option) =>
                option
                    .setName('width')
                    .setDescription('The width to resize to')
                    .setMinValue(1)
                    .setMaxValue(4096)
                    .setRequired(true)
            )
            .addIntegerOption((option) =>
                option
                    .setName('height')
                    .setDescription('The height to resize to')
                    .setMinValue(1)
                    .setMaxValue(4096)
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('drake')
            .setDescription('Generates the drake meme')
            .addStringOption((option) =>
                option
                    .setName('text1')
                    .setDescription(
                        'The text in which drake appears in disproval of'
                    )
                    .setMaxLength(64)
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('text2')
                    .setDescription(
                        'The text in which drake appears in approval of'
                    )
                    .setMaxLength(64)
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('twobuttons')
            .setDescription('Generates the iconic two buttons meme.')
            .addStringOption((option) =>
                option
                    .setName('button1')
                    .setDescription('The text for the first button')
                    .setMaxLength(24)
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('button2')
                    .setDescription('The text for the second button')
                    .setMaxLength(24)
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('man')
                    .setDescription('The text on the nervous sweating man')
                    .setMaxLength(24)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('expandingbrain')
            .setDescription('Generates an expanding brain meme')
            .addStringOption((option) =>
                option
                    .setName('text1')
                    .setDescription('Small brain')
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('text2')
                    .setDescription('Average brain')
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('text3')
                    .setDescription('Big brain')
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('text4')
                    .setDescription('Massive brain')
                    .setRequired(true)
            )
    )

const saveImage = async (
    interaction: ChatInputCommandInteraction,
    canvas: Canvas
) => {
    canvas.saveAsSync('tmp.png')

    const embed = new EmbedBuilder()
        .setTitle(null)
        .setDescription(null)
        .setImage('attachment://tmp.png')
        .setColor(0x2f3136)

    await interaction.editReply({
        embeds: [embed],
        files: ['./tmp.png']
    })

    fs.unlinkSync('./tmp.png')
}

export const execute = async (interaction: ChatInputCommandInteraction) => {
    switch (interaction.options.getSubcommand()) {
        case 'resize': {
            await loading(
                'Hold on...',
                'Processing... hold on for a moment...',
                interaction
            )

            const attachment = interaction.options.getAttachment('image')!
            const width = interaction.options.getInteger('width')!
            const height = interaction.options.getInteger('height')!

            const img = await loadImage(attachment.url)
            const canvas = new Canvas(width, height)
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, width, height)

            await saveImage(interaction, canvas)

            break
        }
        case 'drake': {
            await loading(
                'Processing...',
                'Processing image... this may take a bit...',
                interaction
            )

            const imgUrl = 'https://imgflip.com/s/meme/Drake-Hotline-Bling.jpg'

            const text1 = interaction.options.getString('text1')
            const text2 = interaction.options.getString('text2')

            const img = await loadImage(imgUrl)
            const canvas = new Canvas(512, 512)
            const ctx = canvas.getContext('2d')
            ctx.textWrap = true
            ctx.font = `32px Arial`
            ctx.textAlign = 'left'
            ctx.textBaseline = 'top'

            ctx.drawImage(img, 0, 0, 512, 512)
            ctx.fillText(text1!, 266, 10, 246)

            ctx.fillText(text2!, 266, 266, 246)

            await saveImage(interaction, canvas)
            break
        }
        case 'twobuttons': {
            await loading(
                'Processing...',
                'Processing image... this might take a while...',
                interaction
            )

            const text1 = interaction.options.getString('button1')!
            const text2 = interaction.options.getString('button2')!
            const manText = interaction.options.getString('man') ?? ''

            const imgUrl = 'https://imgflip.com/s/meme/Two-Buttons.jpg'
            const img = await loadImage(imgUrl)

            const canvas = new Canvas(338, 512)
            const ctx = canvas.getContext('2d')

            ctx.textWrap = true
            ctx.font = '16px Arial'
            ctx.textAlign = 'left'
            ctx.textBaseline = 'top'

            ctx.drawImage(img, 0, 0, 338, 512)
            ctx.rotate(-0.2)
            ctx.fillText(text1, 20, 80, 100)
            ctx.font = '13px Arial'
            ctx.fillText(text2, 140, 80, 80)

            ctx.font = '16px Arial'
            ctx.rotate(0.2)
            ctx.textAlign = 'center'
            ctx.fillText(manText, 160, 316)

            await saveImage(interaction, canvas)

            break
        }
        case 'expandingbrain': {
            await loading(
                'Processing...',
                'Processing image... this might take a while...',
                interaction
            )

            const imgUrl = 'https://imgflip.com/s/meme/Expanding-Brain.jpg'

            const text1 = interaction.options.getString('text1')!
            const text2 = interaction.options.getString('text2')!
            const text3 = interaction.options.getString('text3')!
            const text4 = interaction.options.getString('text4')!

            const img = await loadImage(imgUrl)

            const canvas = new Canvas(365, 512)
            const ctx = canvas.getContext('2d')

            ctx.textWrap = true
            ctx.font = '16px Arial'
            ctx.textAlign = 'left'
            ctx.textBaseline = 'top'

            ctx.drawImage(img, 0, 0, 365, 512)
            ctx.fillText(text1, 10, 10, 172)
            ctx.fillText(text2, 10, 150, 172)
            ctx.fillText(text3, 10, 270, 172)
            ctx.fillText(text4, 10, 390, 172)

            await saveImage(interaction, canvas)

            break
        }
    }
}
