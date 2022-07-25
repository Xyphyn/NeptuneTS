import { findInDatabase } from '../database/mongodb.js'
import { config, getConfig } from '../config/config.js'
import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    Guild,
    User
} from 'discord.js'
import { error } from './errorManager.js'

export const decidePunishment = async (
    member: User,
    server: Guild,
    interaction: ChatInputCommandInteraction
) => {
    const warnings = await findInDatabase('warnings', {
        user: member.id,
        guild: server.id
    }).toArray()
    let infractions = 0

    const settings = getConfig(server.id).punishmentSettings

    for (const warning of warnings) {
        if (
            warning.time >
            Date.now() - settings.warningHours * 60 * 60 * 1000
        ) {
            infractions++
        }
    }

    if (infractions >= settings.warningsUntilMute) {
        const guildMember = await server.members.fetch(member.id)
        if (guildMember.bannable) {
            await guildMember
                .timeout(
                    settings.punishmentTime *
                        (infractions - settings.warningsUntilMute + 1)
                )
                .catch((err) => {
                    // no worries
                })
        } else {
            await interaction.channel!.send({
                embeds: [
                    error(
                        'That user is not able to be timed out. Are they a moderator/admin?'
                    )
                ]
            })

            return false
        }

        return true
    } else return false
}
