import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'
import { SlashCommandBuilder } from 'discord.js'
import { getConfig } from '../config/config.js'
import { getTranslation, languageNames } from '../events/reaction.js'

export const data = new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translates text to another language.')
    .addStringOption((option) =>
        option
            .setName('text')
            .setDescription('The text to translate.')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('language')
            .setDescription('The language to translate to')
            .addChoices(
                { name: 'English', value: 'en' },
                { name: 'Spanish', value: 'es' },
                { name: 'French', value: 'fr' },
                { name: 'Russian', value: 'ru' },
                { name: 'Chinese', value: 'zh-CN' },
                { name: 'Japanese', value: 'ja' },
                { name: 'Hindi', value: 'in' },
                { name: 'Polish', value: 'pl' },
                { name: 'Ukrainian', value: 'uk' },
                { name: 'Italian', value: 'it' },
                { name: 'German', value: 'de' },
                { name: 'Hebrew', value: 'iw' },
                { name: 'Swedish', value: 'sv' },
                { name: 'Korean', value: 'ko' },
                { name: 'Greek', value: 'el' }
            )
            .setRequired(true)
    )

export const execute = async (interaction: ChatInputCommandInteraction) => {
    const text = interaction.options.getString('text')
    const language: any = interaction.options.getString('language')!
    const embed = new EmbedBuilder()
        .setTitle('Translation')
        .setDescription(
            `<a:WindowsLoading:998707398267130028> Translating to ${languageNames[language]}...`
        )
        .setColor(getConfig(interaction.guild!.id).embedSettings.color)

    await interaction.reply({
        embeds: [embed]
    })
    const translation = await getTranslation(
        `https://translate.google.com/?sl=auto&tl=${language}&text=${encodeURIComponent(
            text!
        )}&op=translate`
    )

    embed
        .setDescription(`${translation}`)
        .setFooter({ text: `Translated to ${languageNames[language]}` })
        .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.avatarURL()!
        })

    await interaction.editReply({
        embeds: [embed]
    })
}
