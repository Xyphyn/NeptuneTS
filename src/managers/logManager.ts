import { Embed, EmbedBuilder, Guild } from 'discord.js'
import { config } from '../config/config.js'

export let loggingClient: any = undefined

export const setLoggingClient = (client: any) => {
    loggingClient = client
}

export const logEmbed = (embed: EmbedBuilder, guild: Guild) => {
    const logChannel = loggingClient!.channels.cache.get(
        config[guild.id].logging.loggingChannel
    )
    if (!logChannel) return
    logChannel.send({ embeds: [embed] })
}
