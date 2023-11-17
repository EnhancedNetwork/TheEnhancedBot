const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const con = require('../../mysqlConn.js');
const { readFileSync } = require('fs');
const types = JSON.parse(readFileSync('./roleTypes.json'));
const api = require('../../apiRequests.js');

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
        if (!role) return interaction.reply({ content: "You are not eligible to link your account. Please contact a developer.", ephemeral: true });

        const userInfo = await api.getUserByID(discordId);
        // console.log(userInfo);

        if (userInfo)
            return interaction.reply({ content: "You already have this account linked. Please unlink it first.", ephemeral: true });

        if (checkCode(codeInput) === false)
            return interaction.reply({ content: "Invalid Friend Code. Format must include the `#1234` at the end. Example: `friendcode#1234`", ephemeral: true });

        if (role[1].startsWith("s_") && (role[1] !== "s_it" && role[1] !== "s_in")) upAccess = 1;

        api.updateUserByID({
            userID: discordId,
            type: role[1],
            friendcode: codeInput,
            name: discordName,
            overhead_tag: null,
            color: null,
            isUP: upAccess,
            isDev: 0,
            colorCmd: 0,
            debug: 0
        });
        
        return interaction.reply({ content: "Successfully linked your account!", ephemeral: true });
    }
}