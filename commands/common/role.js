/**
 * @fileoverview This module defines a Discord slash command that allows users to view the description of a role in Town of Host: Enhanced.
 * It uses the role names from the game's JSON files to get the role descriptions in the specified language.
 * 
 * Dependencies:
 * - Requires `discord.js` for building and executing Discord commands.
 * 
 * Constants:
 * - None in this file directly; relies on settings from the user data.
 * 
 * @module profileCommand
 * @version 2.0.0
 * @since 2024-08-18
 * 
 * @author 0xDrMoe
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function formatRole(string) {
    return string
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function internalNameToRoleName(gitJson) {
    const result = {};

    for (const key in gitJson) {
        if (key.includes("InfoLong")) {
            const internalName = key.replace("InfoLong", "");
            if (gitJson[internalName]) {
                result[formatRole(gitJson[internalName].toLowerCase())] = {
                    Description: gitJson[key],
                    codeName: internalName
                };
            }
        }
    }

    console.log(`rolecmd: Converted ${Object.keys(result).length} InfoLongs successfully.`);
    return result;
}

async function fetchJson(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${url}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        throw error;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Get the description of a role in Town of Host: Enhanced')
        .addStringOption(option =>
            option.setName('role')
                .setDescription('The role to get the description of')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('language')
                .setDescription('The language to get the description in')
                .addChoices(
                    { name: 'English', value: 'en_US' },
                    { name: 'Latin American', value: 'es_419' },
                    { name: 'Spanish', value: 'es_ES' },
                    { name: 'French', value: 'fr_FR' },
                    { name: 'Japanese', value: 'ja_JP' },
                    { name: 'Portuguese', value: 'pt_BR' },
                    { name: 'Russian', value: 'ru_RU' },
                    { name: 'Chinese (Simplified)', value: 'zh_CN' },
                    { name: 'Chinese (Traditional)', value: 'zh_TW' }
                ))
        .addBooleanOption(option =>
            option.setName('hidden')
                .setDescription('Whether to show the role description to other users')),

    async execute(interaction) {
        try {
            const roleInput = formatRole(interaction.options.getString('role').toLowerCase());
            console.log(`rolecmd: Input - ${roleInput}`);
            const langInput = interaction.options.getString('language') || "en_US";
            console.log(`rolecmd: Language - ${langInput}`);

            const langJson = await fetchJson(`https://raw.githubusercontent.com/0xDrMoe/TownofHost-Enhanced/main/Resources/Lang/${langInput}.json`);
            const lang = internalNameToRoleName(langJson);

            if (!lang[roleInput]) {
                console.log(`rolecmd: Role ${roleInput} does not exist.`);
                return interaction.reply({ content: `The role ${roleInput} does not exist.`, ephemeral: true });
            }

            const { Description: roleInfo, codeName: roleCodeName } = lang[roleInput];
            if (!roleInfo || !roleCodeName) {
                console.log(`rolecmd: Role ${roleInput} has missing data.`);
                return interaction.reply({ content: `The role ${roleInput} does not exist.`, ephemeral: true });
            }

            const sliceIndex = roleInfo.indexOf(":");
            const roleType = roleInfo.slice(1, sliceIndex - 1);
            console.log(`rolecmd: Role Type - ${roleType}`);

            const roleColorJson = await fetchJson('https://raw.githubusercontent.com/0xDrMoe/TownofHost-Enhanced/main/Resources/roleColor.json');
            const roleColor = roleColorJson[roleCodeName] || "#ff1919";

            const embed = new EmbedBuilder()
                .setTitle(`${roleInput}: ${roleType}`)
                .setDescription(roleInfo.slice(sliceIndex + 1))
                .setColor(roleColor)
                .setTimestamp()
                .addFields(
                    { name: "For more information:", value: "[Check out our Website!](https://tohe.weareten.ca/Roles.html)", inline: true },
                    { name: "Want to support TOHE?", value: "[Check out our Subscriptions!](https://weareten.ca/tohe)", inline: true }
                )
                .setFooter({ text: "TOHE by The Enhanced Network", iconURL: "https://i.ibb.co/RvX9B3s/Yeetus-TOHE-Pic.png" });

            const hidden = interaction.options.getBoolean('hidden') ?? true;
            await interaction.reply({ embeds: [embed], ephemeral: hidden });
            console.log(`rolecmd: Sent by ${interaction.member.id}\n-----------------------`);
        } catch (error) {
            console.error('rolecmd: Error executing command:', error);
            await interaction.reply({ content: 'An error occurred while processing your request. Please try again later.', ephemeral: true });
        }
    }
};
