import {
    Channel,
    ChannelType,
    ChatInputCommandInteraction,
    Client,
    Embed,
    EmbedBuilder,
    Guild,
    GuildChannel,
    PermissionFlagsBits,
    TextChannel
} from 'discord.js'
import { config } from '../config/config.js'
import { error } from './errorManager.js'

export let loggingClient: Client | undefined = undefined

export const setLoggingClient = (client: any) => {
    loggingClient = client
}

export const logEmbed = async (
    embed: EmbedBuilder,
    guild: Guild,
    interaction: ChatInputCommandInteraction
) => {
    const logChannel: any = await loggingClient!.channels
        .fetch(config[guild.id].logging.loggingChannel)
        .catch((err) => {
            interaction.channel!.send({
                embeds: [
                    error(
                        'Failed to send log message; Logging channel is not accessible.'
                    )
                ]
            })
        })

    if (!logChannel) return
    logChannel.send({ embeds: [embed] }).catch((err: Error) => {
        interaction.channel!.send({
            embeds: [
                error(
                    'Failed to send log message; Logging channel is not accessible.'
                )
            ]
        })
    })
}
