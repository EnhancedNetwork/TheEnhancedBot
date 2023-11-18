const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { devIDs } = require(__dirname + '/../../config.json');
const api = require(__dirname + '\\..\\..\\apiRequests.js');

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

        if (userInfo.error)
            return interaction.reply({ content: "This user does not have an account linked. Please have them link their account first.", ephemeral: true });

        let result = await api.deleteUserByID(user.id);
        console.log(result);
        console.log(`deletecmd: Result - ${result.result}`);
        return interaction.reply({ content: `Successfully deleted ${user}!`, ephemeral: true });

    }
}