import { createSpinner } from 'nanospinner'

const spinner = createSpinner(chalk.yellow(`Starting bot...`)).start()

import {
    Client,
    Collection,
    GatewayIntentBits,
    EmbedBuilder,
    Partials,
    MessageCollector,
    PermissionFlagsBits,
    Status,
    ActivityType
} from 'discord.js'
import chalk from 'chalk'
import { config as dotenv_config } from 'dotenv'
import fs from 'fs'
import { deploy } from './deploy-commands.js'
import { connectToDatabase, refreshGuilds } from './database/mongodb.js'
import { setLoggingClient } from './managers/logManager.js'
import { config } from './config/config.js'
import { noPermission } from './managers/errorManager.js'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv_config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const client = new Client({
    partials: [Partials.Channel, Partials.Message, Partials.Reaction],
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessageReactions
    ]
})

client.commands = new Collection()
const commandFiles = fs
    .readdirSync(`${__dirname}/commands`)
    .filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
    import(`./commands/${file}`).then((module) => {
        client.commands.set(module.data.name, module)
    })
}

const eventFiles = fs
    .readdirSync(`${__dirname}/events`)
    .filter((file) => file.endsWith('.js'))

for (const file of eventFiles) {
    const event = import(`./events/${file}`).then((event) => {
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args))
        } else {
            client.on(event.name, (...args) => event.execute(...args))
        }
    })
}

client.once('ready', async () => {
    spinner.success({
        text: chalk.green(`Logged in as ${chalk.bold(client.user.username)}`)
    })
    await deploy()
    await connectToDatabase('discord', client).then(() => {
        client.user.setActivity(`Bot is being worked on...`, {
            type: ActivityType.Custom
        })
    })

    setLoggingClient(client)

    setInterval(async () => {
        refreshGuilds(client)
    }, 30000)
})

client.on('guildCreate', async (guild) => {
    await refreshGuilds(client)

    const xy = await client.users.fetch('735626570399481878')
    const embed = new EmbedBuilder()
        .setTitle('New guild')
        .setDescription(`Neptune was added to a new guild! **${guild.name}**`)
        .setColor(0xbd00ff)
    xy.send({
        embeds: [embed]
    })
})

client.on('error', async (err) => {
    sendErrorDM('Error', err)
})

client.on('interactionCreate', async (interaction) => {
    if (interaction.channel.isDMBased()) {
        interaction.reply('Commands are disabled in direct messages.')
        return
    }
    const command = client.commands.get(interaction.commandName)

    if (!command) return
    const perm = command.permissions ?? PermissionFlagsBits.SendMessages
    if (!interaction.member.permissions.has(perm)) {
        await interaction.reply({
            embeds: [noPermission(command.permissionsString)]
        })
        return
    }

    try {
        await command.execute(interaction, client)
    } catch (error) {
        // Error handler
        console.log(error)

        const causes = {
            'Missing Permissions':
                'The bot does not have permission to do that, or that user is not able to be punished.',
            'Unexpected token < in JSON at position 0':
                'You might have input an invalid/inactive subreddit.',
            'Subreddit not found.': 'That subreddit does not exist.',
            'Received one or more errors': "That user can't be banned.",
            'Could not decode image data':
                'That is not an image or the image type is not supported.'
        }
        const stack = error.message

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Error')
            .setDescription(
                `<:BSOD:984972563358814228> \`${error.name}\` occured during execution!`
            )

        if (causes[error.message]) {
            embed.addFields([
                { name: 'Likely Cause', value: causes[error.message] }
            ])
        } else {
            embed.addFields([
                { name: 'Message', value: error.message },
                { name: 'Stack', value: stack }
            ])
        }

        try {
            await interaction.reply({ embeds: [embed] })
            const collector = new MessageCollector(
                interaction.channel,
                (m) => m.author.id === interaction.author.id,
                { time: 5000 }
            )
            collector.on('collect', (message) => {
                if (message.content === 'stack pls') {
                    const stackEmbed = new EmbedBuilder()
                        .setColor('Red')
                        .setTitle('Full Stack')
                        .setDescription(`\`\`\`js${stack}\`\`\``)
                    message.channel.send({ embeds: [stackEmbed] })
                }
                collector.stop()
            })
        } catch (err) {
            try {
                await interaction.editReply({ embeds: [embed] })
                const collector = new MessageCollector(
                    interaction.channel,
                    (m) => m.author.id === interaction.author.id,
                    { time: 5000 }
                )
                collector.on('collect', (message) => {
                    if (message.content === 'stack pls') {
                        const stackEmbed = new EmbedBuilder()
                            .setColor('Red')
                            .setTitle('Full Stack')
                            .setDescription(`\`\`\`js${stack}\`\`\``)
                        message.channel.send({ embeds: [stackEmbed] })
                    }
                    collector.stop()
                })
            } catch (err) {
                await interaction.channel.send({ embeds: [embed] })
                const collector = new MessageCollector(
                    interaction.channel,
                    (m) => m.author.id === interaction.author.id,
                    { time: 5000 }
                )
                collector.on('collect', (message) => {
                    if (message.content === 'stack pls') {
                        const stackEmbed = new EmbedBuilder()
                            .setColor('Red')
                            .setTitle('Full Stack')
                            .setDescription(`\`\`\`js${stack}\`\`\``)
                        message.channel.send({ embeds: [stackEmbed] })
                    }
                    collector.stop()
                })
            }
        }
    }
})

// Alternate error handler

const sendErrorDM = async (type, err) => {
    const embed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription(`**Neptune** caught an \`${type}\``)
        .addFields([
            {
                name: 'Stack',
                value: `\`\`\`js\n${err.stack}\n\`\`\``
            }
        ])
        .setColor('Red')

    const user = await client.users.fetch('735626570399481878')
    user.send({
        embeds: [embed]
    })
}

// process.on('unhandledRejection', (reason, p) => {
//     console.log(' [antiCrash] :: Unhandled Rejection/Catch')
//     console.log(reason, p)
//     sendErrorDM('unhandledRejection', p)
// })

// process.on('uncaughtException', (err, origin) => {
//     console.log(' [antiCrash] :: Uncaught Exception/Catch')
//     console.log(err, origin)
//     sendErrorDM('uncaughtException', err)
// })

// process.on('uncaughtExceptionMonitor', (err, origin) => {
//     console.log(' [antiCrash] :: Uncaught Exception/Catch (MONITOR)')
//     console.log(err, origin)
//     sendErrorDM('uncaughtExceptionMonitor', err)
// })

spinner.update({ text: chalk.yellow('Logging in...') })
client.login(process.env.TOKEN).catch((error) => {
    spinner.error({ text: chalk.red(`${error}`) })
})
