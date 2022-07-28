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

export const execute = async (interaction: ChatInputCommandInteraction) => {
    switch (interaction.options.getSubcommand()) {
        case 'image': {
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

            break
        }
    }
}
