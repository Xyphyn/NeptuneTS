import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { loadState } from "../config/config.js";

export const data = new SlashCommandBuilder()
    .setName('dev')
    .setDescription('Developer commands')
    .addSubcommand(subcommand => subcommand
        .setName('sync')
        .setDescription('Refreshes config from database')
    )

export const permissions = 'SEND_MESSAGES'

export const execute = async (interaction) => {
    if (!(interaction.user.id == 735626570399481878)) {
        interaction.reply(`You... aren't the developer.`)
        return
    }

    const embed = new MessageEmbed()

    switch (interaction.options.getSubcommand()) {
        case 'sync': {
            embed.setTitle('Synced')
                .setDescription('<:WindowsSuccess:977721596468928533> Done. Synced config with database.')
                .setColor('BLURPLE')

            await loadState()

            interaction.reply({
                embeds: [ embed ]
            })
        }
    }
}