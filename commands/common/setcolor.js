const { SlashCommandBuilder } = require('discord.js');
const { readFileSync } = require('fs');
const types = JSON.parse(readFileSync('./roleTypes.json'));
const api = require('../../apiRequests.js');

function checkColor(color) {
    if (color.length != 6) return false;
    if (!/^[0-9A-Fa-f]+$/.test(color)) return false;
    return true;
}

function checkRole(member) {
    for (const categoryKey in types) {
        const category = types[categoryKey];
        for (const roleKey in category) {
            const hasRole = member.roles.cache.has(category[roleKey].roleID);
            if (hasRole) return [category[roleKey], roleKey];
        }
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setcolor')
        .setDescription('Set your color in our database')
        .addStringOption(option => option.setName('color').setDescription('The color you want to set').setRequired(true)),
    async execute(interaction) {
        const discordId = interaction.user.id;
        const color = interaction.options.getString('color');

        console.log(`setcolor - Input: ${discordId} | ${color} `);

        let userInfo = await api.getUserByID(discordId);
        if (!userInfo) {
            console.log(`updatecmd - Error: ${userInfo.error}`);
            return interaction.reply({ content: "This user does not have an account linked. Please have them link their account first.", ephemeral: true });
        }

        const role = await checkRole(interaction.member);

        if (userInfo.error)
            return interaction.reply({ content: `You do not have an account linked. Please link your account instead of updating.`, ephemeral: true });

        if (role[1] === 's_bo') {
            return interaction.reply({ content: `You cannot set your color as a booster.`, ephemeral: true });
        }

        if (!checkColor(color)) 
            return interaction.reply({ content: `Please enter a valid color.`, ephemeral: true });

        userInfo.color = color;
        userInfo = await api.updateUserByID(userInfo, discordId);
        return interaction.reply({ content: `Successfully updated your role to **${role[0].name}**!`, ephemeral: true });
    }
}