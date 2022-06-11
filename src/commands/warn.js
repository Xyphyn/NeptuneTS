import { SlashCommandBuilder } from "@discordjs/builders"
import { Permissions } from "discord.js"
import { dbConfig } from "../database/dbConfig.js"
import { deleteFromDatabase, insertToDatabase } from "../database/mongodb.js"
import { v4 as uuid } from 'uuid'
import { loggingConfig } from "../config/logging.js"
import { MessageEmbed } from "discord.js"
import { embedSettings } from "../config/embeds.js"
import { decidePunishment } from "../managers/punishmentManager.js"
import { logEmbed } from "../managers/logManager.js"
import { emojiSettings } from "../config/emojis.js"
import { config } from "../config/config.js"
import { noPermission } from "../managers/errorManager.js"
import { delay } from "../managers/util.js"

export const data = new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warning commands")
    .addUserOption(option => option
        .setName('user')
        .setDescription('The user to warn.')
        .setRequired(true))
    .addStringOption(option => option
        .setName('reason')
        .setDescription('The reason for the warning.')
        .setRequired(false))

export const permissions = 'SEND_MESSAGES'

export const execute = async (interaction, client) => {

    const user = await interaction.options.getUser('user')
    const guild = await interaction.guild.id

    if (!interaction.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
        interaction.reply({
            embeds: [ noPermission('BAN_MEMBERS') ]
        })
        return
    }

    const reason = await interaction.options.getString('reason')
    const moderator = await interaction.user.id
    const time = new Date().getTime()

    if (user == client.user) {
        const huh = [
            'D- D- Did you just try having ***me*** warn ***__myself__***? :neutral_face:',
            'What the heck are you doing?',
            'You can\'t warn me!',
            'you want *me* to warn *me*?'
        ]

        const uhm = [
            'what... uh...',
            'well this is awkward...',
            'uhm',
            'wat'
        ]

        const okay = [
            'whatever...',
            'okay...?',
            'why though?'
        ]

        await interaction.reply({
            content: huh[~~(Math.random() * huh.length)]
        })

        await delay(1000)
        await interaction.channel.sendTyping();
        await delay(1000)
        await interaction.channel.send(uhm[~~(Math.random() * uhm.length)]);

        await interaction.channel.sendTyping();
        await delay(1000)
        await interaction.channel.send(okay[~~(Math.random() * okay.length)]);

        await delay(1000)
        await interaction.channel.sendTyping();
        await delay(500)
    }

    const data = {
        user: user.id,
        reason: reason,
        moderator: moderator,
        guild: guild,
        time: time,
        id: uuid()
    }

    insertToDatabase(dbConfig.warningCollection, data)

    const embed = new MessageEmbed().setColor(config[interaction.guild.id].embedSettings.color).setAuthor({ name: user.username, iconURL: user.displayAvatarURL() }).addField('Offending User', `<@${user.id}>`, true).addField('Moderator', `<@${moderator}>`, true).addField('Reason', reason ?? 'No reason specified.', true).setFooter({ text: `${data.id}` })

    await logEmbed(embed, interaction.guild)

    if (!(interaction.replied)) {
        await interaction.reply({
            content: `${config[interaction.guild.id].emojiSettings.warn} <@${interaction.options.getUser('user').id}> has been warned. **${interaction.options.getString('reason') ?? 'No reason specified.'}**`,
        })
    } else {
        await interaction.channel.send({
            content: `${config[interaction.guild.id].emojiSettings.warn} <@${interaction.options.getUser('user').id}> has been warned. **${interaction.options.getString('reason') ?? 'No reason specified.'}**`,
        })
    }

    if (await decidePunishment(user, interaction.guild)) {
        await interaction.channel.send(`${config[interaction.guild.id].emojiSettings.mute} <@${interaction.options.getUser('user').id}> has been muted. **Automatic mute after 3 warnings within 24 hours.**`)

        embed.setColor(config[interaction.guild.id].embedSettings.errorColor).setFields([{ name: 'Muted', value: '**Automatic mute after 3 warnings within 24 hours.**' }])

        await logEmbed(embed, interaction.guild)
    }
}