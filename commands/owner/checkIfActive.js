const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { devIDs } = require(__dirname + '/../../config.json');
const { getAllRoleUsers } = require(__dirname + '/../../API Functions/userinfo.js');

module.exports = {
    type: 'owner',
    data: new SlashCommandBuilder()
        .setName('eraseinactive')
        .setDescription('Remove inactive users from the database'),
    async execute(interaction) {
        interaction.deferReply({ ephemeral: true });
        let userInfo = await getAllRoleUsers();
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

        console.log(`Erase Inactive: ${userInfo.length} users found`);

        for (const user of userInfo) {
            interaction.guild.members.fetch();
            const member = await interaction.guild.members.fetch(user.userID).catch(() => {
                notFoundUsers.push(`<@${user.userID}>`);
            });
            if (!member) continue;

            // Boosters
            if (user.type == 's_bo' && member.roles.resolve('1100778961795039292')) {
                boosters.push(`<@${user.userID}>`);
            }
            // Initiates
            else if (user.type == 's_it' && member.roles.resolve('1160995901184168036')) {
                insiders.push(`<@${user.userID}>`);
            }
            // Insiders
            else if (user.type == 's_in' && member.roles.resolve('1160996676731932803')) {
                insiders.push(`<@${user.userID}>`);
            }
            // Specialists
            else if (user.type == 's_sp' && member.roles.resolve('1160998162832576552')) {
                specialists.push(`<@${user.userID}>`);
            }
            // Maestros
            else if (user.type == 's_ms' && member.roles.resolve('1160998207954886817')) {
                maestros.push(`<@${user.userID}>`);
            }
            // Technicians
            else if (user.type == 's_te' && member.roles.resolve('1160998239332474882')) {
                technicians.push(`<@${user.userID}>`);
            }
            // Guardians
            else if (user.type == 's_gd' && member.roles.resolve('1160998302767136798')) {
                guardians.push(`<@${user.userID}>`);
            }
            // Contributors
            else if (user.type == 's_cr' && member.roles.resolve('1096793713453314098')) {
                contributors.push(`<@${user.userID}>`);
            }
            // Junior Contributors
            else if (user.type == 's_jc' && member.roles.resolve('1182541847449567333')) {
                juniorContributors.push(`<@${user.userID}>`);
            }
            // Testers 
            else if (user.type == 's_tr' && member.roles.resolve('1112182767053197378')) {
                testers.push(`<@${user.userID}>`);
            }
            else if (user.type.startsWith('t_')) {
                translators.push(`<@${user.userID}>`);
            }
            else {
                inactiveUsers.push(`<@${user.userID}>`);
            }
        }
        let total = boosters.length + insiders.length + specialists.length + maestros.length + technicians.length + guardians.length + contributors.length + juniorContributors.length + testers.length + translators.length + notFoundUsers.length + inactiveUsers.length;

        console.log(`Erase Inactive: ${total} users found in roles`);

        return interaction.editReply({ content: `**Boosters (${boosters.length})**\n${boosters.join(', ')}\n\n**Insiders (${insiders.length})**\n${insiders.join(', ')}\n\n**Specialists (${specialists.length})**\n${specialists.join(', ')}\n\n**Maestros (${maestros.length})**\n${maestros.join(', ')}\n\n**Technicians (${technicians.length})**\n${technicians.join(', ')}\n\n**Guardians (${guardians.length})**\n${guardians.join(', ')}\n\n**Contributors (${contributors.length})**\n${contributors.join(', ')}\n\n**Junior Contributors (${juniorContributors.length})**\n${juniorContributors.join(', ')}\n\n**Testers (${testers.length})**\n${testers}` });
    }
}