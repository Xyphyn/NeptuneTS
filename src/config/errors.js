import { EmbedBuilder } from "discord.js";
import { embedSettings } from "./embeds.js";

export const errorSettings = {
    "no-permission": new EmbedBuilder().setTitle('Error').setColor(embedSettings.errorColor).setDescription(`<:WindowsCritical:824380490051747840> You do not have permission to use this command.`),
}