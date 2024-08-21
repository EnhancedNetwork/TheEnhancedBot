// This command is used to delete a user's database entry. This is useful for debugging purposes, or if a user wants to unlink their account.
const { SlashCommandBuilder } = require('discord.js');
const { devIDs } = require(__dirname + '/../../config.json');
const { getUserByID, deleteUserByID } = require(__dirname + '/../../API Functions/userinfo.js');

module.exports = {
    type: 'dev',
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

        let userInfo = await getUserByID(user.id);

        if (userInfo.error)
            return interaction.reply({ content: "This user does not have an account linked. Please have them link their account first.", ephemeral: true });

        let result = await deleteUserByID(user.id);
        console.log(`deletecmd: Result - ${result.result}`);
        return interaction.reply({ content: `Successfully deleted ${user}!`, ephemeral: true });

    }
}