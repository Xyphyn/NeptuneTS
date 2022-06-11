export const name = 'messageCreate'
export const once = false

export let bannedWords = []

export const setBannedWords = (words) => {
    bannedWords = words
}

export const execute = async (message) => {
    if (message.author.bot) return
    if (message.guild == null) return

    for (const word of message.content.toLowerCase().split(' ')) {
        if (bannedWords.includes(word)) {
            console.log('test')
        }
    }
}