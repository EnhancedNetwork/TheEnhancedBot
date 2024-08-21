/**
 * @fileoverview This module defines a Discord slash command that allows users to view the website for Town of Host: Enhanced.
 * It provides links to the official website, install instructions, the latest release, and more.
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

async function getLatestTag() {
    const url = 'https://api.github.com/repos/0xDrMoe/TownofHost-Enhanced/tags';

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.length > 0) {
            return data[0].name;
        } else {
            console.error('No tags found');
            return null;
        }
    } catch (error) {
        console.error('Error fetching tags:', error);
    }
}

async function constructLatestReleaseURL() {
    const tag = await getLatestTag();
    if (!tag) return null;
    const version = tag.substring(1);
    return [
        `https://github.com/0xDrMoe/TownofHost-Enhanced/releases/download/${tag}/TOH-Enhanced.${version}.zip`,
        `https://github.com/0xDrMoe/TownofHost-Enhanced/releases/download/${tag}/TOH-Enhanced-Microsoft.${version}.zip`
    ];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('website')
        .setDescription('Get the link to the Town of Host: Enhanced website'),
    async execute(interaction) {

        const versionURLs = await constructLatestReleaseURL();
        const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle("Town of Host: Enhanced")
            .setURL("https://tohe.weareten.ca/")
            .setDescription("This is the official website for Town of Host: Enhanced.\nHere you can find the latest news, roles, and more!")
            .setFooter({ text: "Town of Host: Enhanced", iconURL: "https://i.ibb.co/RvX9B3s/Yeetus-TOHE-Pic.png" })
            .addFields(
                { name: "Need to Install TOHE?", value: "[Install Instructions](https://tohe.weareten.ca/Install.html)", inline: true },
                { name: `Want TOHE ${await getLatestTag()}?`, value: `[Steam/Epic Games](${versionURLs[0]}) | [Xbox App](${versionURLs[1]})`, inline: true },
                { name: "Questions?", value: "[FAQ](https://tohe.weareten.ca/FAQ.html)", inline: true },
                { name: "Learn About the Mod!", value: "[Roles](https://tohe.weareten.ca/Roles.html)", inline: true },
                { name: "Learn About the Team!", value: "[About Us](https://tohe.weareten.ca/AboutUs.html)", inline: true },
                { name: "Want to support TOHE?", value: "[Purchase a Package!](https://weareten.ca/TOHE/)", inline: true },
            )
            .setTimestamp();

        interaction.reply({ embeds: [embed] }).then(console.log(`websitecmd: Sent by ${interaction.member.id}\n-----------------------`));
    }
}
