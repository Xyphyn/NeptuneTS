import { Guild } from "discord.js";
import { config } from "../config/config.js";
import { loggingConfig } from "../config/logging.js";

export let loggingClient = undefined

export const setLoggingClient = (client) => {
    loggingClient = client
}

export const logEmbed = (embed, guild) => {
    const logChannel = loggingClient.channels.cache.get(config[guild.id].logging.loggingChannel)
    if (!logChannel) return;
    logChannel.send({ embeds: [embed] })
}