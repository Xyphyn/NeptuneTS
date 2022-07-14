import { createSpinner } from 'nanospinner'

const spinner = createSpinner(chalk.yellow(`Starting bot...`)).start()

import { Client, Collection, Intents, MessageEmbed } from 'discord.js'
import chalk from 'chalk'
import { config } from 'dotenv'
import fs from 'fs'
import { embedSettings } from './config/embeds.js'
import { errorSettings } from './config/errors.js'
import { deploy } from './deploy-commands.js'
import { connectToDatabase, db, refreshGuilds } from './database/mongodb.js'
import { setLoggingClient } from './managers/logManager.js'
import { loadState, saveState } from './config/config.js'
import { baseConfig } from './config/baseConfig.js'
import { noPermission } from './managers/errorManager.js'
import { Permissions } from 'discord.js'
import { MessageCollector } from 'discord.js'

await config()

export const client = new Client({ partials: ["CHANNEL"], intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.DIRECT_MESSAGES] },)

client.commands = new Collection()
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = import(`./commands/${file}`).then(command => { client.commands.set(command.data.name, command) })
}

const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = import(`./events/${file}`).then((event) => {
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    });
}

client.once('ready', async () => {
    spinner.success({ text: chalk.green(`Logged in as ${chalk.bold(client.user.username)}`) })
    await deploy()
    await connectToDatabase('discord', client)

    await client.user.setActivity("GTA 6", { type: "PLAYING" })
    setLoggingClient(client)

    setInterval(async () => {
        refreshGuilds(client)
    }, 30000)
});

client.on('guildCreate', async () => {
    await refreshGuilds(client)
    await deploy()
})

client.on('interactionCreate', async interaction => {
	const command = client.commands.get(interaction.commandName);

	if (!command) return;
    const perm = command.permissions ?? 'SEND_MESSAGES'
    if (!(interaction.member.permissions.has(perm))) {
        await interaction.reply({ embeds: [ noPermission(perm) ] });
        return;
    }

	try {
		await command.execute(interaction, client);
	} catch (error) {
        // Error handler

        const causes = {
            'Missing Permissions': 'The user is probably not able to be punished.',
            'Unexpected token < in JSON at position 0': 'You might have input an invalid/inactive subreddit.',
            'Subreddit not found.': 'That subreddit does not exist.'
        }
        const stack = error.stack

        const embed = new MessageEmbed().setColor(embedSettings.errorColor)
        .setTitle('Error')
        .setDescription(`<:BSOD:984972563358814228> \`${error.name}\` occured during execution!`)
        .addField('Message', error.message)
        
        if (causes[error.message]) {
            embed.addField('Likely Cause', causes[error.message])
        } else {
            embed.addField('Stack', `${stack.split("\n")[4] ?? 'No stack trace available'}`)
        }

        try {
		    await interaction.reply({ embeds: [ embed ] });
            const collector = new MessageCollector(interaction.channel, m => m.author.id === interaction.author.id, { time: 5000 });
            collector.on('collect', message => {
                if (message.content === 'stack pls') {
                    const stackEmbed = new MessageEmbed().setColor(embedSettings.errorColor)
                        .setTitle('Full Stack')
                        .setDescription(`\`\`\`js${stack}\`\`\``)
                    message.channel.send({ embeds: [ stackEmbed ] })
                }
                collector.stop()
            })
        
        } catch (err) {
            try {
                await interaction.editReply({ embeds: [ embed ] });
                const collector = new MessageCollector(interaction.channel, m => m.author.id === interaction.author.id, { time: 5000 });
                collector.on('collect', message => {
                    if (message.content === 'stack pls') {
                        const stackEmbed = new MessageEmbed().setColor(embedSettings.errorColor)
                            .setTitle('Full Stack')
                            .setDescription(`\`\`\`js${stack}\`\`\``)
                        message.channel.send({ embeds: [ stackEmbed ] })
                    }
                    collector.stop()
                })
            } catch (err) {
                await interaction.channel.send({ embeds: [ embed ] });
                const collector = new MessageCollector(interaction.channel, m => m.author.id === interaction.author.id, { time: 5000 });
                collector.on('collect', message => {
                    if (message.content === 'stack pls') {
                        const stackEmbed = new MessageEmbed().setColor(embedSettings.errorColor)
                            .setTitle('Full Stack')
                            .setDescription(`\`\`\`js${stack}\`\`\``)
                        message.channel.send({ embeds: [ stackEmbed ] })
                    }
                    collector.stop()
                })
            }
        }
	}
});

spinner.update({ text: chalk.yellow('Logging in...') })
client.login(process.env.TOKEN).catch(error => { spinner.error({ text: chalk.red(`${error}`) }) })