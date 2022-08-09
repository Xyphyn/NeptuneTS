import { APIEmbed, ButtonInteraction, Interaction, Message } from 'discord.js'
import { globalConfig } from '../config/globalConfig.js'

interface PollData {
    options: Array<string>
    question: string
    message: Message
}

export const polls = new Map<string, Map<string, string>>()
export const pollDataMap = new Map<string, PollData>()
let expiry = setTimeout(() => {}, -1)

export const handle = async (id: string, interaction: ButtonInteraction) => {
    const opName = id.split('-').slice(-1)[0]

    const poll = polls.get(id)
    if (!poll) {
        interaction.reply({
            ephemeral: true,
            content:
                'That poll has expired. If the timer says otherwise, the bot restarted in the time frame.'
        })
        return
    }

    clearTimeout(expiry)
    expiry = setTimeout(() => {
        poll.delete(id)
    })

    const pollData = pollDataMap.get(id)!
    const option = interaction.customId.split('-')[0]

    if (option == 'op1') {
        poll.set(interaction.user.id, 'op1')
    } else {
        poll.set(interaction.user.id, 'op2')
    }

    let op1 = 0
    let op2 = 0

    for (const choice of poll.values()) {
        if (choice == 'op1') op1++
        else op2++
    }

    const embed: APIEmbed = {
        title: `${pollData.question}`,
        description: `Expires <t:${Math.floor(Date.now() / 1000) + 43200}:R>`,
        fields: [
            {
                name: `${pollData.options[0]}`,
                value: `${op1}`,
                inline: true
            },
            {
                name: `${pollData.options[1]}`,
                value: `${op2}`,
                inline: true
            }
        ],
        color: globalConfig.embedColor
    }

    interaction.deferUpdate()

    interaction.message.edit({
        embeds: [embed]
    })
}

export const newPoll = (
    id: string,
    options: Array<string>,
    question: string,
    message: Message
) => {
    polls.set(id, new Map<string, string>())
    pollDataMap.set(id, {
        options: options,
        question: question,
        message: message
    })
}
