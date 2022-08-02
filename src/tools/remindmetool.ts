import { User } from 'discord.js'

interface Reminder {
    user: User
    reminder: string
}

export const reminders = new Map<string, Reminder>
