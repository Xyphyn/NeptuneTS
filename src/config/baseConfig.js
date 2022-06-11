import { MessageEmbed } from "discord.js";

export let baseConfig = {
    embedSettings: {
        color: '#0099ff',
        successColor: '#0eee0e',
        errorColor: '#ff0f0f',
    },
    emojiSettings: {
        warn: '<:WindowsWarning:977721596846436392>',
        ban: '<:WindowsShieldFailure:977721596506681366>',
        mute: '<:criticalerror:977722153644478534>'
    },
    errorSettings: {
        "no-permission": new MessageEmbed().setTitle('Error').setColor('RED').setDescription(`<:WindowsCritical:824380490051747840> You do not have permission to use this command.`),
    },
    logging: {
        loggingChannel: '977253966851227730',
        logDirectMessages: true
    },
    punishmentSettings: {
        dmUser: false,
        warningsUntilMute: 3,
        punishmentTime: 30 * 60 * 1000
    }
}