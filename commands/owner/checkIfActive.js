const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { devIDs } = require(__dirname + '/../../config.json');
const api = require('../../apiRequests.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eraseinactive')
        .setDescription('Remove inactive users from the database'),
    async execute(interaction) {
        const discordId = interaction.user.id;

        if (!devIDs.includes(discordId))
            return interaction.reply({ content: "You are not allowed to use this command", ephemeral: true });

        let userInfo = await api.getAllRoleUsers();
        let inactiveUsers = [];

        let boosters = [];

        let insiders = [];
        let specialists = [];
        let maestros = [];
        let technicians = [];
        let guardians = [];

        let contributors = [];
        let juniorContributors = [];
        let testers = [];
        let translators = [];

        let notFoundUsers = [];

        for (const user of userInfo) {
            interaction.guild.members.fetch();
            const member = await interaction.guild.members.fetch(user.userID).catch(() => {
                notFoundUsers.push(user.userID);
            });
            if (!member) continue;

            // Boosters
            if (user.type == 's_bo' && member.roles.resolve('1100778961795039292')) {
                boosters.push(user.userID);
            }
            // Insiders
            else if (user.type == 's_in' && member.roles.resolve('1160996676731932803')) {
                insiders.push(user.userID);
            }
            // Specialists
            else if (user.type == 's_sp' && member.roles.resolve('1160998162832576552')) {
                specialists.push(user.userID);
            }
            // Maestros
            else if (user.type == 's_ms' && member.roles.resolve('1160998207954886817')) {
                maestros.push(user.userID);
            }
            // Technicians
            else if (user.type == 's_te' && member.roles.resolve('1160998239332474882')) {
                technicians.push(user.userID);
            }
            // Guardians
            else if (user.type == 's_gd' && member.roles.resolve('1160998302767136798')) {
                guardians.push(user.userID);
            }
            // Contributors
            else if (user.type == 's_cr' && member.roles.resolve('1096793713453314098')) {
                contributors.push(user.userID);
            }
            // Junior Contributors
            else if (user.type == 's_jc' && member.roles.resolve('1182541847449567333')) {
                juniorContributors.push(user.userID);
            }
            // Testers 
            else if (user.type == 's_tr' && member.roles.resolve('1112182767053197378')) {
                testers.push(user.userID);
            }
            else if (user.type.startsWith('t_')) {
                translators.push(user.userID);
            }
            else {
                inactiveUsers.push(user.userID);
            }
        }

        console.log(`Erase Inactive: ${boosters.length} boosters found`);
        console.log(`Erase Inactive: ${insiders.length} insiders found`);
        console.log(`Erase Inactive: ${specialists.length} specialists found`);
        console.log(`Erase Inactive: ${maestros.length} maestros found`);
        console.log(`Erase Inactive: ${technicians.length} technicians found`);
        console.log(`Erase Inactive: ${guardians.length} guardians found`);
        console.log(`Erase Inactive: ${contributors.length} contributors found`);
        console.log(`Erase Inactive: ${juniorContributors.length} junior contributors found`);
        console.log(`Erase Inactive: ${testers.length} testers found`);
        console.log(`Erase Inactive: ${translators.length} translators found`);
        console.log(`Erase Inactive: ${notFoundUsers.length} users not found`);
        console.log(`Erase Inactive: ${inactiveUsers.toString()} inactive users found`);

        return interaction.reply({ content: `Successfully checked!`, ephemeral: true });

    }
}