const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const con = require('../../mysqlConn.js');
const { readFileSync } = require('fs');
const types = JSON.parse(readFileSync('./roleTypes.json'));

function checkRole(member) {
    for (const categoryKey in types) {
        const category = types[categoryKey];
        for (const roleKey in category) {
            const hasRole = member.roles.cache.has(category[roleKey].roleID);
            if (hasRole) return [category[roleKey], roleKey];
        }
    }
}

function checkCode(code) {
    if (code.substring(code.length - 5, code.length - 4) !== "#") return false;
    if (!code.substring(code.length - 4, code.length).match(/^[0-9]+$/)) return false;
    return true;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link your Discord to your Among Us Friend Code')
        .addStringOption(option => option.setName('code').setDescription('Your Among Us Friend Code').setRequired(true)),
    async execute(interaction) {
        const codeInput = interaction.options.getString('code');
        const discordId = interaction.user.id;
        const discordName = interaction.user.username;
        let upAccess = 0;

        const role = checkRole(interaction.member);
        if (!role) return interaction.reply({ content: "You are not eligible to link your account. Please contact a developer." });

        let userInfo = await con.check(`SELECT * FROM role_table WHERE userID = '${discordId}'`);
        userInfo = userInfo[0];

        if (userInfo)
            return interaction.reply({ content: "You already have this account linked. Please unlink it first.", ephemeral: true });

        if (checkCode(codeInput) === false)
            return interaction.reply({ content: "Invalid Friend Code. Format must include the `#1234` at the end. Example: `friendcode#1234`", ephemeral: true });

        if (role[1].startsWith("s_") && role[1] !== "s_it") upAccess = 1;

        await con.check(`INSERT INTO role_table (userID, type, friendcode, name, isUp) 
        VALUES ('${discordId}', '${role[1]}', '${codeInput}', '${discordName}', '${upAccess}')`);
        return interaction.reply({ content: "Successfully linked your account!", ephemeral: true });
    }
}