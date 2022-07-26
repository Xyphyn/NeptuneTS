import {
    ContextMenuCommandInteraction,
    EmbedBuilder,
    MessageContextMenuCommandInteraction
} from 'discord.js'
import { ContextMenuCommandBuilder } from 'discord.js'
import { globalConfig } from '../config/globalConfig.js'
import { getTranslation } from '../events/reaction.js'
import { loading } from '../util/tools.js'

export const data = new ContextMenuCommandBuilder()
    .setName('Translate To English')
    .setType(3)

export const execute = async (
    interaction: MessageContextMenuCommandInteraction
) => {
    await loading('Translating...', 'Translating to English...', interaction)

    const translation = await getTranslation(
        `https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(
            interaction.targetMessage.content
        )}&op=translate`
    )
    const embed = new EmbedBuilder()
        .setTitle('Translation')
        .setDescription(`${translation}`)
        .setColor(globalConfig.embedColor)
        .setAuthor({
            name: interaction.targetMessage.author.username,
            iconURL: interaction.targetMessage.author.avatarURL()!
        })
        .setFooter({ text: `Translated to English` })

    interaction.editReply({
        embeds: [embed]
    })
}
