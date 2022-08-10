import { ButtonInteraction, Interaction } from 'discord.js'
import { handle } from '../tools/polltool.js'

export const name = 'interactionCreate'
export const once = false
export const execute = async (interaction: Interaction) => {
    try {
        if (!interaction.isButton()) return

        if (
            interaction.customId.startsWith('op1-') ||
            interaction.customId.startsWith('op2-')
        )
            handle(interaction.message.id, interaction)
    } catch (e) {
        // ignore
    }
}
