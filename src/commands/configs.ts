import { ChatInputCommandInteraction, PermissionsBitField } from 'discord.js'
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { config, getConfig, saveState } from '../config/config.js'
import { globalConfig } from '../config/globalConfig.js'
import { noPermission } from '../managers/errorManager.js'

export const data = new SlashCommandBuilder()
    .setName('oldconfig')
    .setDescription('[OLD] Advanced config commands.')
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
        subcommand
            .setName('set')
            .setDescription('Sets a config value.')
            .addStringOption((option) =>
                option
                    .setName('key')
                    .setDescription('The key of the config value to set.')
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('value')
                    .setDescription('The value to set the config value to.')
                    .setRequired(true)
            )
    )

export const permissions = PermissionsBitField.Flags.Administrator
export const permissionsString = 'Administrator'

function leaf(obj: object, path: string, value: any) {
    const pList = path.split('.')
    const key = pList.pop()
    const pointer = pList.reduce((accumulator: any, currentValue: any) => {
        if (accumulator[currentValue] === undefined)
            accumulator[currentValue] = {}
        return accumulator[currentValue]
    }, obj)
    if (pointer[key!] != undefined) {
        pointer[key!] = value
        return obj
    } else return false
}

export const execute = async (interaction: ChatInputCommandInteraction) => {
    if (interaction.user.id != '735626570399481878') {
        interaction.reply({ embeds: [noPermission('Bot Owner')] })
        return
    }
    const embed = new EmbedBuilder()
        .setTitle('Setting configs....')
        .setDescription(`${globalConfig.loadingEmoji} Setting configs...`)
        .setColor(getConfig(interaction).embedSettings.color)
    if (interaction.options.getSubcommand() === 'set') {
        await interaction.reply({
            embeds: [embed]
        })

        const key = interaction.options.getString('key')
        const value = interaction.options.getString('value')

        const result = leaf(getConfig(interaction), key!, value)

        await saveState()

        embed
            .setTitle('Set')
            .setDescription(
                `<:WindowsSuccess:824380489712140359> Set ${key} to ${value}`
            )

        if (!result) {
            embed
                .setTitle('Failed')
                .setDescription(
                    `<:WindowsCritical:824380490051747840> Failed to set ${key} to ${value}`
                )
        }

        await interaction.editReply({
            embeds: [embed]
        })
    }
}
