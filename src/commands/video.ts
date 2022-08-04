import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction
} from 'discord.js'
import { Command } from '../types/types'
import { loading } from '../util/tools.js'
import fs from 'fs'
import { error } from '../managers/errorManager.js'
import ffmpeg from 'fluent-ffmpeg'
import fetch from 'node-fetch'

export const data: Command = {
    name: 'video',
    description: 'Video commands',
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'lowquality',
            description: 'Ruins the quality of a video.',
            options: [
                {
                    type: ApplicationCommandOptionType.Attachment,
                    name: 'video',
                    description: 'The video to modify.',
                    required: true
                }
            ]
        }
    ]
}

export const execute = async (interaction: ChatInputCommandInteraction) => {
    await loading(
        'Processing',
        'Processing... this will take a while...',
        interaction
    )

    const types = ['mp4', 'mkv', 'mov', 'webm']
    const attachment = interaction.options.getAttachment('video')!
    const attachmentType = `${attachment.url.split('.').slice(-1)[0]}`

    if (!types.includes(attachmentType)) {
        await interaction.editReply({
            embeds: [error('That file type is not supported.')]
        })
        return
    }

    const res = await fetch(attachment.url)
    const file: any = `file.${attachmentType}`

    await new Promise((fulfill) => {
        res.body!.pipe(fs.createWriteStream(file)).on('finish', fulfill)
    })

    const cmd = ffmpeg(`file.${attachmentType}`)
        .FPS(10)
        .videoBitrate('5k')
        .setSize('360x240')
        .aspectRatio('360x240')
        .audioBitrate('8k')
        .output(`out.${attachmentType}`)

    cmd.run()
    await interaction.editReply({
        files: [`./out.${attachmentType}`],
        embeds: []
    })
    fs.unlinkSync(`./out.${attachmentType}`)
    fs.unlinkSync(`./file.${attachmentType}`)
}
