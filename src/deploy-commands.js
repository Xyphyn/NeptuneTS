import { createSpinner } from 'nanospinner'
import chalk from 'chalk'

import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import fs from 'fs'
import { client } from './app.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function deploy() {
    return new Promise(async (resolve, reject) => {
        const spinner = createSpinner(
            chalk.yellow(
                `Deploying commands for ${chalk.bold(
                    `${client.guilds.cache.size}`
                )} guilds...`
            )
        ).start()
        let commands = []
        const commandFiles = fs
            .readdirSync(`${__dirname}/commands`)
            .filter((file) => file.endsWith('.js'))

        for (const file of commandFiles) {
            const command = await import(`./commands/${file}`)
            commands.push(command.data.toJSON())
        }

        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN)

        const guilds = client.guilds.cache.map((guild) => guild.id)
        let counter = guilds.length
        for (const guild of guilds) {
            rest.put(
                Routes.applicationGuildCommands(
                    process.env.DEV_CLIENT_ID,
                    guild
                ),
                { body: commands }
            )
                .then(() => {})
                .catch((error) =>
                    spinner.error({ text: chalk.red(`${error}`) })
                )
            counter -= 1
            if (counter <= 0)
                spinner.success({ text: chalk.green(`Deployed commands`) })
        }
        resolve()
    })
}
