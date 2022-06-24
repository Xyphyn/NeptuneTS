import { findInDatabase } from '../database/mongodb.js'
import { punishmentConfig } from '../config/punishment.js'

export const decidePunishment = async (member, server) => {
    const warnings = await findInDatabase('warnings', { user: member.id, guild: server.id }).toArray()
    let infractions = 0

    for (const warning of warnings) {
        if (warning.time > Date.now() - 86400000) {
            infractions++
        }
    }

    console.log(infractions)
    console.log(punishmentConfig.warningsUntilMute)
    if (infractions >= punishmentConfig.warningsUntilMute) {
        const guildMember = await server.members.fetch(member.id)
        await guildMember.timeout(punishmentConfig.punishmentTime * (infractions - punishmentConfig.warningsUntilMute + 1))
        return true;
    } else return false;
}