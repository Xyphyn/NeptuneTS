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

export const setConfig = (_config) => {
    config = _config
}

export const getConfig = (interaction) => {
    return config[interaction.guild.id]
}

export let config = {

}