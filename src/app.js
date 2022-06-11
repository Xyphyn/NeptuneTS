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

    await client.user.setActivity("your mother", { type: "WATCHING" })
    setLoggingClient(client)
});

client.on('guildCreate', async () => {
    await refreshGuilds(client)
})

client.on('interactionCreate', async interaction => {
	const command = client.commands.get(interaction.commandName);

	if (!command) return;
    try {
        if (!(interaction.member.permissions.has(command.permissions))) {
            await interaction.reply({ embeds: [ errorSettings['no-permission'] ] });
            return;
        }
    } catch (err) {
        await interaction.reply({ content: 'oopsie poopsie my code did an idk' });
        console.log(err)
        return;
    }

	try {
		await command.execute(interaction, client);
	} catch (error) {
        const causes = {
            'Missing Permissions': 'The user is probably not able to be punished.'
        }

        const embed = new MessageEmbed().setColor(embedSettings.errorColor)
        .setTitle('Error')
        .setDescription(`<:BSOD:984972563358814228> **${error}** occured during execution!`)
        .addField('Message', error.message)
        .addField('Stack', error.stack.split("\n")[4])
        
        if (causes[error.message]) {
            embed.addField('Likely Cause', causes[error.message])
        }

        try {
		    await interaction.reply({ embeds: [ embed ] });
        } catch (err) {
            try {
                await interaction.channel.send({ embeds: [ embed ] });
            } catch (err) {
                await interaction.editReply({ embeds: [ embed ] });
            }
        }
	}
});

spinner.update({ text: chalk.yellow('Logging in...') })
client.login(process.env.TOKEN).catch(error => { spinner.error({ text: chalk.red(`${error}`) }) })