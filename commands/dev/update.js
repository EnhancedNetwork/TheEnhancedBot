const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const con = require('../../mysqlConn.js');
const { readFileSync } = require('fs');
const types = JSON.parse(readFileSync('./roleTypes.json'));

async function updateOverheadTag(tag, user) {
    try {
        if (tag.length > 50) {
            console.log(`updatecmd - Overhead tag too long: ${tag}`);
            return `**Overhead Tag too long (50 character limit):** \`${tag}\`\n`;
        }
        else if (tag.length < 1) {
            console.log(`updatecmd - Overhead tag too short: ${tag}`);
            return `**Overhead Tag too short (1 character minimum):** \`${tag}\`\n`;
        }
        else {
            await con.check(`UPDATE role_table SET overhead_tag = '${tag}' WHERE userID = '${user.id}'`);
            console.log(`updatecmd - Updated overhead_tag: ${tag}`);
            return `**Updated Overhead Tag:** \`${tag}\`\n`;
        }
    } catch (err) {
        console.log(`updatecmd - Error updating overhead_tag for ${user.id}: ${err}`);
        return `**Error updating Overhead Tag:** \`${err}\`\n`;
    }
}

async function updateColor(color, user) {
    try {
        if (color.length != 6 || !color.match(/^[0-9a-fA-F]+$/))
            return `**Invalid color, please use a 6 digit hex code WITHOUT the # (e.g. FF0000):** \`${color}\`\n`;
        else {
            color = color.toUpperCase();
            await con.check(`UPDATE role_table SET color = '${color}' WHERE userID = '${user.id}'`);
            console.log(`updatecmd - Updated color: ${color}`);
            return `**Updated Color:** \`${color}\`\n`;
        }
    } catch (err) {
        console.log(`updatecmd - Error updating color: ${color}`);
        return `**Error updating Color:** \`${err}\`\n`;
    }
}

async function updateUp(up, user) {
    let bool = up;
    if (up == true) bool = 1;
    else if (up == false) bool = 0;
    try {
        await con.check(`UPDATE role_table SET isUp = '${bool}' WHERE userID = '${user.id}'`);
        console.log(`updatecmd - Updated isUp: ${bool}`);
        return `**Updated Up Access:** \`${up}\`\n`;
    } catch (err) {
        console.log(`updatecmd - Error updating isUp: ${up}`);
        return `**Error updating Up Access:** \`${err}\`\n`;
    }
}

async function updateDev(dev, user) {
    let bool = dev;
    if (dev == true) bool = 1;
    else if (dev == false) bool = 0;
    try {
        await con.check(`UPDATE role_table SET isDev = '${bool}' WHERE userID = '${user.id}'`);
        console.log(`updatecmd - Updated isDev: ${dev}`);
        return `**Updated Dev Access:** \`${dev}\`\n`;
    } catch (err) {
        console.log(`updatecmd - Error updating isDev: ${dev}`);
        return `**Error updating Dev Access:** \`${err}\`\n`;
    }
}

async function updateColorCmd(colorcmd, user) {
    let bool = colorcmd;
    if (colorcmd == true) bool = 1;
    else if (colorcmd == false) bool = 0;
    try {
        await con.check(`UPDATE role_table SET colorCmd = '${bool}' WHERE userID = '${user.id}'`);
        console.log(`updatecmd - Updated colorCmd: ${colorcmd}`);
        return `**Updated colorCmd:** \`${colorcmd}\`\n`;
    } catch (err) {
        console.log(`updatecmd - Error updating colorCmd: ${colorcmd}`);
        return `**Error updating colorCmd:** \`${err}\`\n`;
    }
}

async function updateDebug(debug, user) {
    let bool = debug;
    if (debug == true) bool = 1;
    else if (debug == false) bool = 0;
    try {
        await con.check(`UPDATE role_table SET debug = '${bool}' WHERE userID = '${user.id}'`);
        console.log(`updatecmd - Updated debug: ${debug}`);
        return `**Updated debug:** \`${debug}\`\n`;
    } catch (err) {
        console.log(`updatecmd - Error updating debug: ${debug}`);
        return `**Error updating debug:** \`${err}\`\n`;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Update a database entry for a user')
        .addUserOption(option => option.setName('user').setDescription('The user to update').setRequired(true))
        .addStringOption(option => option.setName('overhead_tag').setDescription('The tag to set for the user'))
        .addStringOption(option => option.setName('color').setDescription('The color to set for the user'))
        .addBooleanOption(option => option.setName('up').setDescription('Whether or not the user has up access'))
        .addBooleanOption(option => option.setName('dev').setDescription('Whether or not the user has dev access'))
        .addBooleanOption(option => option.setName('colorcmd').setDescription('Whether or not the user has color command access'))
        .addBooleanOption(option => option.setName('debug').setDescription('Whether or not the user has debug access')),
    async execute(interaction) {
        const discordId = interaction.user.id;
        const user = interaction.options.getMember('user');
        const overhead_tag = interaction.options.getString('overhead_tag');
        const color = interaction.options.getString('color');
        let up = interaction.options.getBoolean('up');
        let dev = interaction.options.getBoolean('dev');
        let colorcmd = interaction.options.getBoolean('colorcmd');
        let debug = interaction.options.getBoolean('debug');

        console.log(`updatecmd - Input: ${user.id} | ${overhead_tag} | ${color} | ${up} | ${dev} | ${colorcmd} | ${debug}`);

        if (discordId != "800552171048927243") return interaction.reply({ content: "You are not allowed to use this command", ephemeral: true });

        let userInfo = await con.check(`SELECT * FROM role_table WHERE userID = '${user.id}'`);
        if (!userInfo[0])
            return interaction.reply({ content: "This user does not have an account linked. Please have them link their account first.", ephemeral: true });
        userInfo = userInfo[0];
        let finalResult = "";

        if (overhead_tag) finalResult += await updateOverheadTag(overhead_tag, user);
        if (color) finalResult += await updateColor(color, user);
        if (up == true || up == false) finalResult += await updateUp(up, user);
        if (dev == true || dev == false) finalResult += await updateDev(dev, user);
        if (colorcmd == true || colorcmd == false) finalResult += await updateColorCmd(colorcmd, user);
        if (debug == true || debug == false) finalResult += await updateDebug(debug, user);

        return interaction.reply({ content: `Successfully updated ${user}!\n${finalResult}`, ephemeral: true });

    }
}