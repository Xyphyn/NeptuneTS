import { ColorResolvable, Guild } from 'discord.js'
import { v4 } from 'uuid'
import { client } from '../app.js'
import {
    deleteAllInDatabase,
    findInDatabase,
    insertToDatabase,
    updateInDatabase
} from '../database/mongodb.js'

export const saveState = async () => {
    return new Promise(async (resolve, reject) => {
        const guilds = client.guilds.cache.map((guild: Guild) => guild.id)
        for (const guild of guilds) {
            const guildInDatabase = await findInDatabase('config', {
                id: guild
            }).toArray()
            if (config[guild]) {
                if (guildInDatabase[0] == null) {
                    config[guild].id = guild
                    delete config[guild]._id
                    await insertToDatabase('config', config[guild])
                } else {
                    const a: any = guildInDatabase[0]
                    delete a._id
                    delete config[guild]._id
                    if (JSON.stringify(config[guild]) == JSON.stringify(a)) {
                        continue
                    }
                    config[guild].id = guild
                    await updateInDatabase(
                        'config',
                        { id: guild },
                        config[guild]
                    )
                }
            } else console.log("There somehow wasn't a config at that guild.")
        }
        // await insertToDatabase('config', config)
        resolve(null)
    })
}

export const loadState = async () => {
    return new Promise(async (resolve, reject) => {
        const guilds = client.guilds.cache.map((guild: Guild) => guild.id)
        for (const guild of guilds) {
            const results = await findInDatabase('config', {
                id: guild
            }).toArray()
            try {
                config[guild] = results[0]
            } catch (e) {
                console.error(e)
            }
        }

        resolve(null)
    })
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
