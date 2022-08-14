import { APIEmbed, ButtonInteraction, Interaction, Message } from 'discord.js'
import { globalConfig } from '../config/globalConfig.js'

interface PollData {
    options: Array<string>
    question: string
    message: Message
    expiration: number | undefined
}

export const polls = new Map<string, Map<string, string>>()
export const pollDataMap = new Map<string, PollData>()
let expiry = setTimeout(() => {}, -1)

export const handle = async (id: string, interaction: ButtonInteraction) => {
    const opName = interaction.customId.split('-').slice(-1)[0]

    const poll = polls.get(id)
    if (!poll) {
        interaction.reply({
            ephemeral: true,
            content:
                'That poll has expired. If the timer says otherwise, the bot restarted in the time frame.'
        })
        return
    }

    const pollData = pollDataMap.get(id)!
    poll.set(interaction.user.id, `op${pollData.options.indexOf(opName)}`)

    clearTimeout(expiry)
    expiry = setTimeout(() => {
        polls.delete(id)
    }, pollData.expiration!)

    // if (option == 'op1') {
    //     poll.set(interaction.user.id, 'op1')
    // } else {
    //     poll.set(interaction.user.id, 'op2')
    // }

    const opCounts = new Array(pollData.options.length).fill(0)

    for (const choice of poll.values()) {
        // if (choice == 'op1') op1++
        // else op2++

        const chIndex: any = choice.split('p')[1]

        opCounts[chIndex] += 1
    }

    const embed: APIEmbed = {
        title: `${pollData.question}`,
        description: `Expires <t:${Math.floor(
            Date.now() / 1000 + pollData.expiration! / 1000
        )}:R>`,
        // fields: [
        //     {
        //         name: `${pollData.options[0]}`,
        //         value: `${op1}`,
        //         inline: true
        //     },
        //     {
        //         name: `${pollData.options[1]}`,
        //         value: `${op2}`,
        //         inline: true
        //     }
        // ],
        fields: pollData.options.map((val, index) => ({
            name: `${val}`,
            value: opCounts[index],
            inline: true
        })),
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
    message: Message,
    expiration: number
) => {
    polls.set(id, new Map<string, string>())
    pollDataMap.set(id, {
        options: options,
        question: question,
        message: message,
        expiration: expiration
    })
}

export const delPoll = (id: string) => {
    polls.delete(id)
}
