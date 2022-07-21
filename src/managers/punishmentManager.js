import { findInDatabase } from '../database/mongodb.js'
import { punishmentConfig } from '../config/punishment.js'
import { config, getConfig } from '../config/config.js'

export const decidePunishment = async (member, server) => {
    const warnings = await findInDatabase('warnings', {
        user: member.id,
        guild: server.id
    }).toArray()
    let infractions = 0

    for (const warning of warnings) {
        if (
            warning.time >
            Date.now() -
                config[server.id].punishmentSettings.warningHours *
                    60 *
                    60 *
                    1000
        ) {
            infractions++
        }
    }

    if (infractions >= punishmentConfig.warningsUntilMute) {
        const guildMember = await server.members.fetch(member.id)
        try {
            await guildMember.timeout(
                punishmentConfig.punishmentTime *
                    (infractions - punishmentConfig.warningsUntilMute + 1)
            )
        } catch (e) {
            // Doesn't really matter. You can tell they weren't timed out
        }
        return true
    } else return false
}
