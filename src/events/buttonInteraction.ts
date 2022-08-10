import { ButtonInteraction, Interaction, TextChannel } from 'discord.js'
import { client } from '../app.js'
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

        if (interaction.customId.startsWith('reply-')) {
            const channel = (await client.channels.fetch(
                `${interaction.customId.split('-')[1]}`
            )) as TextChannel

            await interaction.reply({
                ephemeral: true,
                content:
                    'What do you want to reply with? You have 30 seconds to answer.'
            })

            const collector = interaction.channel!.createMessageCollector({
                dispose: true,
                time: 30000
            })

            collector.on('collect', async (msg) => {
                await msg.fetch()
                await channel.send({
                    content: msg.content
                })

                collector.stop()
            })
        }
    } catch (e) {
        // ignore
    }
}
