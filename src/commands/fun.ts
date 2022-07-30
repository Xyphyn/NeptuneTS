import { config, getConfig } from '../config/config.js'
import fetch from 'node-fetch'
import {
    ActionRowBuilder,
    SlashCommandBuilder,
    ButtonBuilder,
    EmbedBuilder,
    ChatInputCommandInteraction,
    Embed
} from 'discord.js'
import { v4 as uuid } from 'uuid'
import { FetchError } from 'node-fetch'
import { ButtonStyle } from 'discord.js'
import { InteractionType } from 'discord.js'
import { loading } from '../util/tools.js'

export const data = new SlashCommandBuilder()
    .setName('fun')
    .setDescription('Fun commands')
    .addSubcommand((subcommand) =>
        subcommand.setName('fact').setDescription('Get a random fact!')
    )
    .addSubcommand((subcommand) =>
        subcommand.setName('coinflip').setDescription('Flips a coin. Why not?')
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('cat')
            .setDescription('Gets a picture of a cute kitty.')
            .addBooleanOption((option) =>
                option
                    .setName('animated')
                    .setDescription('Gets an animated cat.')
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('reddit')
            .setDescription('Gets a random post from a subreddit.')
            .addStringOption((option) =>
                option
                    .setName('subreddit')
                    .setDescription(
                        'The subreddit to get posts from. (Default memes)'
                    )
                    .setRequired(false)
            )
    )

export const execute = async (interaction: ChatInputCommandInteraction) => {
    switch (interaction.options.getSubcommand()) {
        case 'fact': {
            await loading('Hold on...', 'Fetching a fact...', interaction)
            const res = await fetch(
                'https://uselessfacts.jsph.pl/random.json?language=en'
            )
            const json: any = await res.json()
            const embed = new EmbedBuilder()
                .setTitle('Useless Fact')
                .setDescription(
                    `${json.text} ${
                        ['🤔', '🤯', '😮'][Math.floor(3 * Math.random())]
                    }`
                )
                .setURL(json.source_url)
                .setColor(getConfig(interaction).embedSettings.color)

            await interaction.editReply({
                embeds: [embed]
            })

            break
        }
        case 'coinflip': {
            const row: any = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('coinflip-heads')
                    .setLabel('Heads 👨')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('coinflip-tails')
                    .setLabel('Tails 🐒')
                    .setStyle(ButtonStyle.Secondary)
            )
            const embed = new EmbedBuilder()
                .setTitle('Heads or tails?')
                .setDescription(`The decision is yours. Choose wisely.`)
                .setFooter({ text: 'You have 30 seconds to decide.' })
                .setColor(getConfig(interaction).embedSettings.color)

            const message = await interaction.reply({
                embeds: [embed],
                components: [row]
            })

            const collector =
                interaction.channel!.createMessageComponentCollector({
                    filter: async (int) => {
                        try {
                            const reply = await interaction.fetchReply()
                            return int.message.id === reply.id
                        } catch (e) {
                            return true
                        }
                    },
                    time: 30000
                })

            collector.on('collect', (btnInt) => {
                const decision =
                    btnInt.customId === 'coinflip-heads' ? 'Heads' : 'Tails'
                const response = ['Heads', 'Tails'][
                    Math.floor(2 * Math.random())
                ]
                const win = decision === response

                btnInt.deferUpdate()

                embed
                    .setTitle(`${response}!`)
                    .setDescription(win ? `You won! 🥳` : `You lost! ☹️`)
                    .setFooter(null)

                interaction.editReply({
                    embeds: [embed],
                    components: []
                })

                collector.stop()
            })

            break
        }
        case 'cat': {
            const message = await loading(
                'Hold on...',
                'Fetching a cat...',
                interaction
            )
            const animated = interaction.options.getBoolean('animated')
            const id = uuid()
            const row: any = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(id)
                    .setLabel('Another! 🔄️')
                    .setStyle(ButtonStyle.Secondary)
            )

            const getCat = async () => {
                const url = animated
                    ? 'https://api.thecatapi.com/v1/images/search?mime_types=gif'
                    : 'https://cataas.com/cat?json=true'
                const res = await fetch(url)
                const json: any = await res.json()

                const embed = new EmbedBuilder()
                    .setTitle(
                        `Meow ${
                            ['😺', '😸', '😹', '😻'][
                                Math.floor(4 * Math.random())
                            ]
                        }`
                    )
                    .setImage(
                        animated ? json[0].url : `https://cataas.com${json.url}`
                    )
                    .setColor('#2F3136')

                await interaction.editReply({
                    embeds: [embed],
                    components: [row]
                })
            }

            getCat()

            const collector =
                interaction.channel!.createMessageComponentCollector({
                    filter: async (int) => {
                        try {
                            const reply = await interaction.fetchReply()
                            if (
                                int.message.id === reply.id &&
                                int.type === InteractionType.MessageComponent
                            ) {
                                if (!(int.user == interaction.user)) {
                                    int.reply({
                                        content:
                                            'Those buttons are not for you.',
                                        ephemeral: true
                                    })
                                    return false
                                }
                                return true
                            } else {
                                return false
                            }
                        } catch (e) {
                            return false
                        }
                    },
                    time: 900000
                })

            collector.on('collect', (btnInt) => {
                if (btnInt.customId === id) {
                    getCat()
                }
                try {
                    btnInt.deferUpdate()
                } catch (e) {
                    // i have no clue what happened
                }
            })
            break
        }
        case 'reddit': {
            await loading('Hold on...', 'Grabbing posts...', interaction)
            const subreddit =
                interaction.options.getString('subreddit') ?? 'memes'
            const res = await fetch(
                `https://www.reddit.com/r/${subreddit}.json`
            )
            let json: any
            try {
                json = await res.json()
            } catch (e) {
                throw new FetchError('Subreddit not found.', 'FetchError')
            }
            if (
                res.status === 404 ||
                json.data === undefined ||
                json.data.children[0] === undefined
            )
                throw new FetchError('Subreddit not found.', 'FetchError')
            const nextId = 'reddit-next'
            const prevId = 'reddit-prev'
            let index = -1
            const row: any = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('reddit-next')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('reddit-prev')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Secondary)
            )

            const refresh = async (index: number) => {
                return new Promise(async (resolve, reject) => {
                    const res = await fetch(
                        `https://www.reddit.com/r/${subreddit}.json?limit=${
                            index + 25
                        }`
                    )
                    json = await res.json()
                    resolve(null)
                })
            }

            let nsfwCheck = 0

            const update = async (next: boolean) => {
                next ? index++ : index--

                if (
                    json.data.children[index] == undefined ||
                    json.data.children[index].data == undefined
                ) {
                    if (
                        index < 100 &&
                        json.data.children.length >= 25 &&
                        index >= 0
                    ) {
                        await refresh(index)
                    } else {
                        disable(next ? true : false, next ? false : true)
                        return
                    }
                }

                const post = json.data.children[index]

                if (
                    post.data.thumbnail == 'nsfw' ||
                    post.data.stickied ||
                    post.data.pinned ||
                    post.data.over_18
                ) {
                    if (post.data.over_18) {
                        nsfwCheck += 1
                    }
                    if (nsfwCheck >= 5) {
                        const embed2 = new EmbedBuilder()
                            .setTitle('Error')
                            .setDescription(
                                'It appears this subreddit contains a large amount of nsfw content. Unfortunately, this has to be restricted for now.'
                            )
                            .setColor(0xff0000)
                        await interaction.editReply({
                            embeds: [embed2]
                        })
                        return
                    }
                    update(next)
                    return
                }

                const embed = new EmbedBuilder()
                    .setTitle(post.data.title)
                    .setImage(post.data.url)
                    .setDescription(
                        post.data.selftext.length >= 1
                            ? post.data.selftext
                            : null
                    )
                    .setURL(`https://reddit.com${post.data.permalink}`)
                    .setFooter({
                        text: `👍 ${post.data.ups} 💬 ${post.data.num_comments}`
                    })
                    .setColor(getConfig(interaction).embedSettings.color)

                await interaction.editReply({
                    embeds: [embed],
                    components: [row]
                })
            }

            const collector =
                interaction.channel!.createMessageComponentCollector({
                    filter: async (int) => {
                        try {
                            const reply = await interaction.fetchReply()
                            if (int.message.id === reply.id && int.isButton()) {
                                if (!(int.user == interaction.user)) {
                                    int.reply({
                                        content:
                                            'Those buttons are not for you.',
                                        ephemeral: true
                                    })
                                    return false
                                }
                                return true
                            } else {
                                return false
                            }
                        } catch (e) {
                            return false
                        }
                    },
                    time: 900000
                })

            const disable = (next: boolean, prev: boolean) => {
                // clear collector if nothing collected within 1 minute
                if (next && prev) collector.stop()
                const row: any = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('reddit-next')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(next),
                    new ButtonBuilder()
                        .setCustomId('reddit-prev')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(prev)
                )

                try {
                    interaction
                        .editReply({
                            components: [row]
                        })
                        .catch((err) => {
                            // ignore
                        })
                } catch (e) {
                    // message was deleted
                }
            }

            let timeout = setTimeout(() => {
                try {
                    disable(true, true)
                } catch (e) {
                    /* ignore */
                }
            }, 30000)

            collector.on('collect', (btnInt) => {
                clearTimeout(timeout)

                timeout = setTimeout(() => {
                    try {
                        disable(true, true)
                    } catch (e) {
                        /* ignore */
                    }
                }, 30000)

                if (btnInt.customId === nextId) {
                    update(true)
                } else {
                    update(false)
                }

                try {
                    btnInt.deferUpdate()
                } catch (e) {
                    // i have no clue what happened
                }
            })

            update(true)

            break
        }
    }
}
