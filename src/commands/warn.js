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

export const data = new SlashCommandBuilder().setName("warn").setDescription("Warning commands").addSubcommand(subcommand =>  subcommand.setName("add").setDescription("Warns a user.").addUserOption(option => option.setName('user').setDescription('The user to warn.').setRequired(true)).addStringOption(option => option.setName('reason').setDescription('The reason for the warning.').setRequired(false))).addSubcommand(subcommand => subcommand.setName("delete").setDescription("Deletes a warning").addStringOption(option => option.setName('uuid').setDescription('The warning UUID (found in modlogs)').setRequired(true)))

export const permissions = Permissions.FLAGS.SEND_MESSAGES

export const execute = async (interaction, client) => {
    
    const user = await interaction.options.getUser('user')
    const guild = await interaction.guild.id

    if (interaction.options.getSubcommand() === "add") {
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
            
            await new Promise((resolve, reject) => { setTimeout(() => resolve(), 1000) });

            await interaction.channel.sendTyping();
            await new Promise((resolve, reject) => { setTimeout(() => resolve(), 750) });
            await interaction.channel.send(uhm[~~(Math.random() * uhm.length)]);
            
            await interaction.channel.sendTyping();
            await new Promise((resolve, reject) => { setTimeout(() => resolve(), 1000) });
            await interaction.channel.send(okay[~~(Math.random() * okay.length)]);

            await new Promise((resolve, reject) => { setTimeout(() => resolve(), 1000) });
            await interaction.channel.sendTyping();
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
    
        await logEmbed(embed)
    
        await interaction.channel.send({
            content: `${config[interaction.guild.id].emojiSettings.warn} <@${interaction.options.getUser('user').id}> has been warned. **${interaction.options.getString('reason') ?? 'No reason specified.'}**`,
        })

        if (!(interaction.replied)) {
            interaction.reply({
                content: 'Warned that user.',
                ephemeral: true
            })
        }
    
        if (await decidePunishment(user, interaction.guild)) {
            await interaction.channel.send(`${config[interaction.guild.id].emojiSettings.mute} <@${interaction.options.getUser('user').id}> has been muted. **Automatic mute after 3 warnings within 24 hours.**`)
    
            embed.setColor(config[interaction.guild.id].embedSettings.errorColor).setFields([{ name: 'Muted', value: '**Automatic mute after 3 warnings within 24 hours.**' }])
    
            await logEmbed(embed)
        }

    } else if (interaction.options.getSubcommand() === 'delete') {
        if (!interaction.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
            interaction.reply({
                embeds: [ noPermission('BAN_MEMBERS') ]
            })
            return
        }
        
        const uuid = await interaction.options.getString('uuid')

        deleteFromDatabase(dbConfig.warningCollection, { id: uuid })

        const embed = new MessageEmbed().setColor(config[interaction.guild.id].embedSettings.errorColor).addField('Warning deleted', `${uuid}`, true).addField('Moderator', `<@${interaction.user.id}>`, true)
        const embed2 = new MessageEmbed().setColor(config[interaction.guild.id].embedSettings.errorColor).setTitle('Warning deleted').setDescription(`<:WindowsRecycleBin:824380487920910348> Warning of UUID \`${uuid}\` has been deleted.`)

        await logEmbed(embed2)

        await interaction.reply({
            embeds: [embed2]
        })
    }
}