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

export const execute = async (interaction: ChatInputCommandInteraction) => {
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

    canvas.saveAsSync('tmp.png')

    const embed = new EmbedBuilder()
        .setTitle(null)
        .setDescription(null)
        .setImage('attachment://tmp.png')
        .setColor(0x2f3136)
        .setFooter({ text: `${width} • ${height}` })

    await interaction.editReply({
        embeds: [embed],
        files: ['./tmp.png']
    })

    fs.unlinkSync('./tmp.png')
}
