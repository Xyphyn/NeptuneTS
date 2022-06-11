import chalk from 'chalk'
import { MongoClient } from 'mongodb'
import { createSpinner } from 'nanospinner'
import { baseConfig } from '../config/baseConfig.js'
import { config, loadState, saveState, setConfig } from '../config/config.js'
import { deploy } from '../deploy-commands.js'
import { dbConfig } from './dbConfig.js'


export let db = undefined

export const refreshGuilds = async (client) => {
    return new Promise((resolve, reject) => {
        const guilds = client.guilds.cache.map(guild => guild.id)
        guilds.forEach(guild => {
            if (!config[guild]) {
                config[guild] = baseConfig
            }
        })

        deploy()
    
        saveState()
        resolve()
    })
}

export async function connectToDatabase(db_name, _client) {
    MongoClient.connect(process.env.MONGO_URI, async (err, client) => {
        const spinner = createSpinner(chalk.yellow(`Connecting to database...`)).start()
        if (err) throw err
        db = client.db(db_name)
        spinner.success({ text: `${chalk.green(`Connected to database`)}`})
        await loadState()

        // If there is nothing in the database, save the default config.
        if (config == undefined || config == null) {
            setConfig(baseConfig)
            await saveState()
        }
        
        await refreshGuilds(_client)
    })
}

export const insertToDatabase = (collection, data) => {
    if (!db) throw new Error('Database not connected')

    return db.collection(collection).insertOne(data)
}

export const deleteFromDatabase = (collection, data) => {
    if (!db) throw new Error('Database not connected')

    return db.collection(collection).deleteOne(data)
}

export const deleteAllInDatabase = (collection) => {
    if (!db) throw new Error('Database not connected')

    return db.collection(collection).deleteMany({ })
}

export const updateInDatabase = (collection, data, updated) => {
    if (!db) throw new Error('Database not connected')

    return db.collection(collection).updateOne(data, {'$set': updated })
}

export const findInDatabase = (collection, data) => {
    if (!db) throw new Error('Database not connected')

    return db.collection(collection).find(data)
}