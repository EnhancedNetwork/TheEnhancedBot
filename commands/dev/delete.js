const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { devIDs } = require('../../config.json');
const con = require('../../mysqlConn.js');
const api = require('../../apiRequests.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Delete a database entry for a user')
        .addUserOption(option => option.setName('user').setDescription('The user to update').setRequired(true)),
    async execute(interaction) {
        const discordId = interaction.user.id;
        const user = interaction.options.getMember('user');

        console.log(`deletecmd - Input: ${user.id}`);

        if (!devIDs.includes(discordId))
            return interaction.reply({ content: "You are not allowed to use this command", ephemeral: true });

        let userInfo = await api.getUserByID(user.id);
        console.log(userInfo);
        if (!userInfo)
            return interaction.reply({ content: "This user does not have an account linked. Please have them link their account first.", ephemeral: true });

        await api.deleteUserByID(user.id);
        return interaction.reply({ content: `Successfully deleted ${user}!`, ephemeral: true });

    }
}