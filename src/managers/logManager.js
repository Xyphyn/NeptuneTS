import { loggingConfig } from "../config/logging.js";

export let loggingClient = undefined

export const setLoggingClient = (client) => {
    loggingClient = client
}

export const logEmbed = (embed) => {
    const logChannel = loggingClient.channels.cache.get(loggingConfig.loggingChannel)
    if (!logChannel) return;
    logChannel.send({ embeds: [embed] })
}