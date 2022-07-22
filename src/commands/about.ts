import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder
} from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('about')
    .setDescription('About this bot!')

export const execute = async (interaction: ChatInputCommandInteraction) => {
    const embed = new EmbedBuilder()
        .setColor('#5865f2')
        .setTitle('Neptune')
        .setDescription(`A general purpose discord bot.`)
        .addFields([
            { name: 'Version', value: '0.5.0' },
            { name: 'Branch', value: 'dev' }
        ])

    await interaction.reply({
        embeds: [embed]
    })
}
