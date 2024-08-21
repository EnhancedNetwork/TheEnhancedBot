const { SlashCommandBuilder } = require('discord.js');
const { readFileSync } = require('fs');
const types = JSON.parse(readFileSync('./roleTypes.json'));
const { getUserByID, updateUserByID } = require(__dirname + '/../../API Functions/userinfo.js');

function checkRole(member) {
    for (const categoryKey in types) {
        const category = types[categoryKey];
        for (const roleKey in category) {
            if (member.roles.cache.has(category[roleKey].roleID)) {
                return [category[roleKey], roleKey];
            }
        }
    }
    return [null, null];
}

module.exports = {
    type: 'tohe',
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Update your account information in our database'),
    async execute(interaction) {
        const discordId = interaction.user.id;
        const isSponsor = interaction.member.roles.cache.has('1161429535020040282');
        
        console.log(`updatecmd - Input: ${discordId}`);

        try {
            let userInfo = await getUserByID(discordId);
            if (!userInfo) {
                return interaction.reply({ content: "This user does not have an account linked. Please link your account first.", ephemeral: true });
            }

            const [role, roleKey] = checkRole(interaction.member);

            if (!role) {
                return interaction.reply({ content: "No valid role found for this user.", ephemeral: true });
            }

            if (roleKey === userInfo.type) {
                return interaction.reply({ content: "Your role is already up to date!", ephemeral: true });
            }

            userInfo.type = roleKey;
            if (roleKey === 's_bo') {
                userInfo.overhead_tag = 'Booster';
                userInfo.color = 'FFC0CB';
            } else if (isSponsor) {
                userInfo.overhead_tag = 'Sponsor';
                userInfo.color = 'FF0000';
            } else if (role.name.includes('Translator')) {
                userInfo.overhead_tag = 'Translator';
                userInfo.color = '00FF00';
            } else if (roleKey === 's_cr') {
                userInfo.isUP = 1;
                userInfo.isDev = 1;
                userInfo.debug = 1;
                userInfo.colorCmd = 1;
            }

            userInfo = await updateUserByID(userInfo, discordId);
            return interaction.reply({ content: `Successfully updated your role to **${role.name}**!`, ephemeral: true });

        } catch (error) {
            console.error(`updatecmd - Error: ${error.message}`);
            return interaction.reply({ content: "An error occurred while updating your role. Please try again later.", ephemeral: true });
        }
    }
}
