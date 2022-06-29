import { MessageEmbed } from "discord.js";
import { embedSettings } from "../config/embeds.js";
import { loggingConfig } from "../config/logging.js";
import { client } from '../app.js'
import { config } from "../config/config.js";

export const name = 'messageCreate';
export const once = false
export const execute = async (message) => {
    if (message.author.bot) return;

    if (!(message.guild == null)) return

    const embed = new MessageEmbed({
        title: 'Direct Message',
        description: `${message.content}`,
        author: {
            name: message.author.username,
            iconURL: message.author.displayAvatarURL()
        },
        color: embedSettings.color,
        timestamp: new Date()
    })

    if (loggingConfig.logDirectMessages) {
        client.channels.cache.get(loggingConfig.loggingChannel).send({
            embeds: [embed]
        })
    }
}