import { findInDatabase } from '../database/mongodb.js'
import { config, getConfig } from '../config/config.js'
import { Guild, User } from 'discord.js'

export const decidePunishment = async (member: User, server: Guild) => {
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
        try {
            await guildMember.timeout(
                settings.punishmentTime *
                    (infractions - settings.warningsUntilMute + 1)
            )
        } catch (e) {
            // Doesn't really matter. You can tell they weren't timed out
        }
        return true
    } else return false
}
