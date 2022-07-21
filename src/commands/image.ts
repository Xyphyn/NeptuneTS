import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import fetch from 'node-fetch'
import tmp from 'tmp'
import fs from 'fs'

export const data = new SlashCommandBuilder()
    .setName('image')
    .setDescription('Image commands')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('resize')
            .addAttachmentOption((option) =>
                option
                    .setName('image')
                    .setDescription(
                        'The image to resize (paste from clipboard)'
                    )
                    .setRequired(true)
            )
            .addNumberOption((option) =>
                option
                    .setName('width')
                    .setRequired(true)
                    .setDescription('The width to resize to')
            )
            .addNumberOption((option) =>
                option
                    .setName('height')
                    .setDescription('The height to resize to')
                    .setRequired(true)
            )
    )

export const execute = async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply()

    const width = interaction.options.getNumber('width')
    const height = interaction.options.getNumber('height')
    const image = interaction.options.getAttachment('image')

    const file: any = tmp.fileSync()

    const res = await fetch(image!.url)
    fs.writeFileSync(file, await res.text())
    console.log(res.text)
}
