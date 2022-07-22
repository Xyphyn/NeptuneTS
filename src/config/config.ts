import { ColorResolvable } from 'discord.js'
import {
    deleteAllInDatabase,
    findInDatabase,
    insertToDatabase
} from '../database/mongodb.js'

export const saveState = async () => {
    return new Promise(async (resolve, reject) => {
        await deleteAllInDatabase('config')
        await insertToDatabase('config', config)
        resolve(null)
    })
}

export const loadState = async () => {
    config = await findInDatabase('config', {}).toArray()
    config = config[0]
}

export const setConfig = (_config: any) => {
    config = _config
}

export const getConfig: any = (interaction: any) => {
    if (interaction.replied === undefined) {
        // This means that a guild id was passed in instead
        return config[interaction]
    }
    return config[interaction.guild.id]
}

export const getColor: any = (interaction: any) => {
    return getConfig(interaction).embedSettings.color
}

export let config: any = {}
