import { MessageEmbed } from "discord.js";
import { deleteAllInDatabase, deleteFromDatabase, findInDatabase, insertToDatabase, updateInDatabase } from "../database/mongodb.js";
import { baseConfig } from "./baseConfig.js";

export const saveState = async () => {
    return new Promise(async (resolve, reject) => {
        await deleteAllInDatabase('config')
        await insertToDatabase('config', config)
        resolve()
    })
}

export const loadState = async () => {
    config = await findInDatabase('config', { }).toArray()
    config = config[0]
}

export const setConfig = (config) => {
    config = config
} 

export let config = {
    '977253880163352577': {
        embedSettings: {
            color: '#0099ff',
            successColor: '#0eee0e',
            errorColor: '#ff0f0f',
        },
        emojiSettings: {
            warn: '<:WindowsWarning:977721596846436392>',
            ban: '<:WindowsShieldFailure:977721596506681366>',
            mute: '<:criticalerror:977722153644478534>'
        },
        errorSettings: {
            "no-permission": new MessageEmbed().setTitle('Error').setColor('RED').setDescription(`<:WindowsCritical:824380490051747840> You do not have permission to use this command.`),
        },
        logging: {
            loggingChannel: '977253966851227730',
            logDirectMessages: true
        },
        punishmentSettings: {
            dmUser: false,
            warningsUntilMute: 3,
            punishmentTime: 30 * 60 * 1000
        }
    }
}