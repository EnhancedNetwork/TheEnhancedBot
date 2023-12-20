const { SlashCommandBuilder } = require('discord.js');
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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Update your account information in our database'),
    async execute(interaction) {
        const discordId = interaction.user.id;

        console.log(`updatecmd - Input: ${discordId} `);

        let userInfo = await api.getUserByID(discordId);
        if (!userInfo) {
            console.log(`updatecmd - Error: ${userInfo.error}`);
            return interaction.reply({ content: "This user does not have an account linked. Please have them link their account first.", ephemeral: true });
        }

        const role = checkRole(interaction.member);

        if (role[1] === userInfo.type) {
            console.log(`updatecmd - Error: User already up to date.`);
            return interaction.reply({ content: "Your role is already up to date!", ephemeral: true });
        }
        else {
            userInfo.type = role[1];
            if (userInfo.error)
                return interaction.reply({ content: `You do not have an account linked. Please link your account instead of updating.`, ephemeral: true });

            if (role[1] === 's_bo') {
                userInfo.overhead_tag = 'Booster';
                userInfo.color = 'ffc0cb'
            }
            else if (role[0].name.includes('Translator')) {
                userInfo.overhead_tag = 'Translator';
                userInfo.color = '00ff00'
            }
            else if (role[1] === 's_cr') {
                userInfo.isUP = 1;
                userInfo.isDev = 1;
                userInfo.debug = 1;
                userInfo.colorCmd = 1;
            }
            userInfo = await api.updateUserByID(userInfo, discordId);
            return interaction.reply({ content: `Successfully updated your role to **${role[0].name}**!`, ephemeral: true });
        }



    }
}