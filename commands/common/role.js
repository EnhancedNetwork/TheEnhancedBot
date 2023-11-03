const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const con = require('../../mysqlConn.js');

function formatRole(string) {
    let stringArray = string.split(" ");
    stringArray = stringArray.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return stringArray.join(" ");
}

function checkFaction(string) {
    if (string === "Crewmates") return "#8cffff";
    else if (string === "Impostors") return "#ff0000";
    else if (string === "Neutrals") return "#7c8c8d";
    else if (string === "Add-ons") return "#ff9ace";
}

function internalNameToRoleName(gitJson) {
    const roleInfo = {};

    for (const key in gitJson) {
        if (key.includes("InfoLong")) {
            const internalName = key.replace("InfoLong", "");
            if (internalName in gitJson) {
                roleInfo[formatRole(gitJson[internalName].toLowerCase())] = gitJson[key];
            }
        }
    }
    console.log(`rolecmd: internalNameToRoleName successfully converted ${Object.keys(roleInfo).length} InfoLongs.`);
    return roleInfo;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Get the description of a role in Town of Host: Enhanced')
        .addStringOption(option => option.setName('role').setDescription('The role to get the description of').setRequired(true))
        .addStringOption(option => option.setName('language').setDescription('The language to get the description in').setRequired(false)
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
            )),
    async execute(interaction) {

        const roleInput = formatRole(interaction.options.getString('role'));
        console.log("rolecmd - Input: " + roleInput);
        const langInput = interaction.options.getString('language') || "en_US";
        console.log("rolecmd - Language: " + langInput);

        let repoLangURL;
        await fetch(`https://raw.githubusercontent.com/0xDrMoe/TownofHost-Enhanced/main/Resources/Lang/${langInput}.json`)
            .then((response) => {
                repoLangURL = response;
                console.log(`rolecmd - RawURL: https://raw.githubusercontent.com/0xDrMoe/TownofHost-Enhanced/main/Resources/Lang/${langInput}.json`);
            })
            .catch(() =>
                interaction.reply({ content: `rolecmd: The language ${langInput} does not exist.`, ephemeral: true }));
        const langJson = await repoLangURL.json();

        const lang = internalNameToRoleName(langJson);

        let roleInfo = lang[roleInput];
        if (!roleInfo) return interaction.reply({ content: `The role ${roleInput} does not exist.`, ephemeral: true })
            .then(console.log(`rolecmd: Role ${roleInput} does not exist.`));

        const sliceIndex = roleInfo.indexOf(":");

        // Extract role type from the roleInfo
        const roleType = roleInfo.slice(1, sliceIndex - 1);
        console.log("rolecmd - Role Type: " + roleType);

        // Extract role description from the roleInfo
        roleInfo = roleInfo.slice(sliceIndex + 1);
        console.log("rolecmd - Role Description: " + roleInfo);

        const embed = new EmbedBuilder()
            .setTitle(roleInput + ": " + roleType)
            .setDescription(roleInfo)
            .setColor(checkFaction(roleType))
            .setTimestamp()
            .addFields(
                { name: "For more information:", value: "[Check out our Website!](https://tohre.dev/Roles.html)", inline: true },
                { name: "Want to support TOHE?", value: "[Check out our Ko-Fi!](https://ko-fi.com/tohen)", inline: true }
            )
            .setFooter({ text: "Town of Host: Enhanced", iconURL: "https://i.ibb.co/RvX9B3s/Yeetus-TOHE-Pic.png" });

        interaction.reply({ embeds: [embed] }).then(console.log(`rolecmd: Sent by ${interaction.member.id}\n-----------------------`));
    }
}