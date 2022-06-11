import { MessageEmbed } from "discord.js";
import { embedSettings } from "../config/embeds.js";

export const noPermission = (required) => {
    const embed = new MessageEmbed().setTitle('Missing Permission').setDescription('<:WindowsShieldUAC:824380489409626126> You don\'t have permission to use this command.').addField('Required', `\`${required}\``, true).setColor(embedSettings.errorColor)
    return embed;
}