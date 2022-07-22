import { EmbedBuilder, Message } from 'discord.js'
import { client } from '../app.js'

export const name = 'messageCreate'
export const once = false
export const execute = async (message: Message) => {
    if (message.author.bot) return

    if (!(message.guild == null)) return

    const embed = new EmbedBuilder({
        title: 'Direct Message',
        description: `${message.content}`,
        author: {
            name: message.author.username,
            iconURL: message.author.displayAvatarURL()
        },
        color: 0x0099ff,
        timestamp: new Date().getTime()
    })

    const loggingChannel: any = await client.channels.fetch(
        '977253966851227730'
    )

    loggingChannel.send({
        embeds: [embed]
    })
}
