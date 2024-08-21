const { SlashCommandBuilder } = require('discord.js');
const { devIDs } = require(__dirname + '/../../config.json');

module.exports = {
    type: 'owner',
    data: new SlashCommandBuilder()
        .setName('leaveserver')
        .setDescription('Leave a server with a given ID')
        .addStringOption(option => option.setName('serverid').setDescription('The ID of the server to leave').setRequired(true)),
    async execute(interaction) {
        const serverId = interaction.options.getString('serverid');
        const guild = interaction.client.guilds.cache.get(serverId);

        if (!guild)
            return interaction.reply({ content: "The server with the given ID was not found", ephemeral: true });

        guild.leave().then(() => {
                interaction.reply({ content: `Successfully left server with ID ${serverId}`, ephemeral: true });
            }).catch(err => {
                console.error(err);
                interaction.reply({ content: "An error occurred while trying to leave the server", ephemeral: true });
            });
    }
}