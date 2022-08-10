import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CategoryChannel,
    Channel,
    DMChannel,
    EmbedBuilder,
    Message,
    TextChannel
} from 'discord.js'
import { client } from '../app.js'

export const name = 'messageCreate'
export const once = false
export const execute = async (message: Message) => {
    if (message.author.bot) return

    if (message.guild != null) return

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

    const loggingChannel = (await client.channels.fetch(
        '977253966851227730'
    )) as TextChannel

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId(`reply-${message.channel.id}`)
            .setStyle(ButtonStyle.Primary)
            .setEmoji(`💬`)
            .setLabel('Reply')
    )

    await loggingChannel!.send({
        embeds: [embed],
        components: [row]
    })
}
