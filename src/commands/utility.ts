import {
    ActionRowBuilder,
    ActivityType,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Interaction,
    MessageComponentInteraction,
    SlashCommandBuilder
} from 'discord.js'
import { config, getColor, getConfig } from '../config/config.js'
import { error, noPermission } from '../managers/errorManager.js'

export const data = new SlashCommandBuilder()
    .setName('utility')
    .setDescription('Utility commands')
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
        subcommand
            .setName('embed')
            .setDescription('Creates an embed.')
            .addStringOption((option) =>
                option
                    .setName('title')
                    .setDescription('The title of the embed.')
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('description')
                    .setDescription('The description of the embed.')
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('color')
                    .setDescription('The color of the embed.')
                    .setRequired(false)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('epoch')
            .setDescription('Gets the current unix timestamp.')
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('status')
            .setDescription('Sets the status of the bot')
            .addStringOption((option) =>
                option
                    .setName('status-type')
                    .setDescription('The type of status')
                    .setRequired(true)
                    .setChoices(
                        {
                            name: 'Competing in',
                            value: `${ActivityType.Competing}`
                        },
                        {
                            name: 'Listening to',
                            value: `${ActivityType.Listening}`
                        },
                        {
                            name: 'Watching',
                            value: `${ActivityType.Watching}`
                        },
                        {
                            name: 'Streaming',
                            value: `${ActivityType.Streaming}`
                        },
                        {
                            name: 'Playing',
                            value: `${ActivityType.Playing}`
                        }
                    )
            )
            .addStringOption((option) =>
                option
                    .setName('status-message')
                    .setDescription('The message to display')
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('calculator')
            .setDescription('A calculator. Why did I waste my time on this')
    )

export const execute = async (
    interaction: ChatInputCommandInteraction,
    client: any
) => {
    const subcommand = interaction.options.getSubcommand()
    switch (subcommand) {
        case 'embed': {
            const title = interaction.options.getString('title')
            const description = interaction.options.getString('description')

            const hexRegex = '^#(([0-9a-fA-F]{2}){3}|([0-9a-fA-F]){3})$'
            const colorCheck = interaction.options.getString('color') ?? ''
            const color = colorCheck.match(hexRegex)
                ? colorCheck
                : getConfig(interaction).embedSettings.color

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(color)

            await interaction.reply({
                embeds: [embed]
            })

            break
        }
        case 'epoch': {
            const epoch = Math.floor(Date.now() / 1000)
            const embed = new EmbedBuilder()
                .setTitle(`Timestamp: \`${epoch}\``)
                .setDescription(`<t:${epoch}>`)
                .setColor('#2F3136')

            await interaction.reply({
                embeds: [embed]
            })

            break
        }
        case 'status': {
            if (interaction.user.id != '735626570399481878') {
                await interaction.reply({
                    embeds: [noPermission('Bot Owner')]
                })
                return
            }

            const message = interaction.options.getString('status-message')
            const type = interaction.options.getString('status-type')!

            await client.user.setActivity(message, { type: parseInt(type) })

            const color = getColor(interaction)

            const embed = new EmbedBuilder()
                .setTitle(`Status set`)
                .setDescription(
                    `<:WindowsSuccess:977721596468928533> Status was set`
                )
                .setColor(color)

            interaction.reply({
                embeds: [embed]
            })

            break
        }
        case 'calculator': {
            const rows = [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId('calc-clear')
                        .setStyle(ButtonStyle.Danger)
                        .setLabel('C'),
                    new ButtonBuilder()
                        .setCustomId('calc-(')
                        .setStyle(ButtonStyle.Success)
                        .setLabel('('),
                    new ButtonBuilder()
                        .setCustomId('calc-)')
                        .setStyle(ButtonStyle.Success)
                        .setLabel(')'),
                    new ButtonBuilder()
                        .setCustomId('calc-/')
                        .setLabel('/')
                        .setStyle(ButtonStyle.Success)
                ),
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId('calc-7')
                        .setStyle(ButtonStyle.Primary)
                        .setLabel('7'),
                    new ButtonBuilder()
                        .setCustomId('calc-8')
                        .setStyle(ButtonStyle.Primary)
                        .setLabel('8'),
                    new ButtonBuilder()
                        .setCustomId('calc-9')
                        .setStyle(ButtonStyle.Primary)
                        .setLabel('9'),
                    new ButtonBuilder()
                        .setCustomId('calc-*')
                        .setLabel('*')
                        .setStyle(ButtonStyle.Success)
                ),
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId('calc-4')
                        .setStyle(ButtonStyle.Primary)
                        .setLabel('4'),
                    new ButtonBuilder()
                        .setCustomId('calc-5')
                        .setStyle(ButtonStyle.Primary)
                        .setLabel('5'),
                    new ButtonBuilder()
                        .setCustomId('calc-6')
                        .setStyle(ButtonStyle.Primary)
                        .setLabel('6'),
                    new ButtonBuilder()
                        .setCustomId('calc--')
                        .setLabel('-')
                        .setStyle(ButtonStyle.Success)
                ),
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId('calc-1')
                        .setStyle(ButtonStyle.Primary)
                        .setLabel('1'),
                    new ButtonBuilder()
                        .setCustomId('calc-2')
                        .setStyle(ButtonStyle.Primary)
                        .setLabel('2'),
                    new ButtonBuilder()
                        .setCustomId('calc-3')
                        .setStyle(ButtonStyle.Primary)
                        .setLabel('3'),
                    new ButtonBuilder()
                        .setCustomId('calc-+')
                        .setLabel('+')
                        .setStyle(ButtonStyle.Success)
                ),
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId('calc-←')
                        .setStyle(ButtonStyle.Secondary)
                        .setLabel('←'),
                    new ButtonBuilder()
                        .setCustomId('calc-0')
                        .setStyle(ButtonStyle.Primary)
                        .setLabel('0'),
                    new ButtonBuilder()
                        .setCustomId('calc-.')
                        .setStyle(ButtonStyle.Primary)
                        .setLabel('.'),
                    new ButtonBuilder()
                        .setCustomId('calc-=')
                        .setLabel('=')
                        .setStyle(ButtonStyle.Success)
                )
            ]

            let expression = '0'

            const embed = new EmbedBuilder()
                .setDescription(`\`\`\`js\n${expression}\n\`\`\``)
                .setColor(0x2f3136)

            await interaction.reply({
                embeds: [embed],
                components: rows
            })

            const collector =
                interaction.channel?.createMessageComponentCollector({
                    filter: async (int: MessageComponentInteraction) => {
                        const reply = await interaction.fetchReply()
                        return int.message.id === reply.id
                    },
                    idle: 30000,
                    time: 600000
                })!

            collector.on('collect', async (int: ButtonInteraction) => {
                if (expression.includes('=')) {
                    expression = ''
                }
                const expr = int.customId.replace('calc-', '')
                const regex = '([-+*/.()]|[-+]?[0-9])'
                if (expr.match(regex)) {
                    if (expression == '0') expression = ''
                    expression += expr
                } else if (expr == '=') {
                    try {
                        expression += ` = ${eval(expression)}`
                    } catch (e) {
                        await int.reply({
                            ephemeral: true,
                            embeds: [error('Expression evaluation failed.')]
                        })
                        return
                    }
                } else if (expr == 'clear') {
                    expression = '0'
                } else if (expr == '←') {
                    if (expression.length > 1)
                        expression = expression.slice(0, -1)
                    else if (expression.length == 1) expression = '0'
                }

                embed.setDescription(`\`\`\`js\n${expression}\n\`\`\``)
                const msg = await interaction.fetchReply()
                msg.edit({
                    embeds: [embed]
                })
                int.deferUpdate().catch((e) => {})
            })

            collector.on('end', async () => {
                for (const row of rows) {
                    for (const button of row.components) {
                        button.setDisabled(true)
                    }
                }

                const msg = await interaction.fetchReply()
                msg.edit({
                    components: rows
                })
            })
        }
    }
}
