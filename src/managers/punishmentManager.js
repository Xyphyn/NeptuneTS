import { findInDatabase } from '../database/mongodb.js'
import { punishmentConfig } from '../config/punishment.js'

export const decidePunishment = async (member, server) => {
    const warnings = await findInDatabase('warnings', { user: member.id, guild: server.id}).toArray()
    /**
     * @type {number}
     * @description The amount of warnings the user has gotten within 24 hours
     */
    let infractions = 0

    for (const warning of warnings) {
        if (warning.time > Date.now() - 86400000) {
            infractions++
        }
    }
    if (infractions >= punishmentConfig.warningsUntilMute) {
        const guildMember = server.members.cache.get(member.id)
        await guildMember.timeout(punishmentConfig.punishmentTime * (infractions - punishmentConfig.warningsUntilMute + 1))
        return true;
    } else return false;
}