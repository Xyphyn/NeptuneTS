import { EmbedBuilder } from 'discord.js'

export let baseConfig = {
    embedSettings: {
        color: '#0099ff',
        successColor: '#0eee0e',
        errorColor: '#ff0f0f'
    },
    emojiSettings: {
        warn: '<:WindowsWarning:977721596846436392>',
        ban: '<:WindowsShieldFailure:977721596506681366>',
        mute: '<:criticalerror:977722153644478534>',
        success: '<:WindowsSuccess:977721596468928533>'
    },
    errorSettings: {
        'no-permission': new EmbedBuilder()
            .setTitle('Error')
            .setColor('#ff0a0a')
            .setDescription(
                `<:WindowsCritical:824380490051747840> You do not have permission to use this command.`
            )
    },
    logging: {
        loggingChannel: '977253966851227730',
        logDirectMessages: true
    },
    punishmentSettings: {
        dmUser: false,
        warningsUntilMute: 2,
        warningHours: 48,
        punishmentTime: 30 * 60 * 1000
    },
    translation: {
        enabled: true
    }
}
