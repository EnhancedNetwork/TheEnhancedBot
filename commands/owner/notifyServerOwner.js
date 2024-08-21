const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { devIDs } = require(__dirname + '/../../config.json');

module.exports = {
    type: 'owner',
    data: new SlashCommandBuilder()
        .setName('notifyowner')
        .setDescription('Notify the owner of a server')
        .addStringOption(option => option.setName('serverid').setDescription('The ID of the server to leave').setRequired(true)),
    async execute(interaction) {
        const serverId = interaction.options.getString('serverid');
        const guild = interaction.client.guilds.cache.get(serverId);

        if (!guild)
            return interaction.reply({ content: "The server with the given ID was not found", ephemeral: true });

        const owner = await guild.fetchOwner();

        const embed = new EmbedBuilder()
            .setTitle('⚠️ Important Notice ⚠️')
            .setDescription(`You have been notified by the owner of this bot. This is to inform you that the bot owner has requested to notify you about something important.\n\n` +
                `You have invited this bot to your server **before it was made public**. Please remove the bot from your server and join the official server to get the latest updates and support.`
            )
            .setColor('Red')
            .setTimestamp()
            .addFields(
                { name: 'Server Information', value: `**Name:** ${guild.name}\n**ID:** ${guild.id}` },
                {
                    name: 'Contact Us',
                    value: `If you want to use the bot, please join The Enhanced Network and create a ticket by going to [our Discord server](https://discord.gg/tohe)`
                }
            );

        owner.send({ embeds: [embed] });
        interaction.reply({ content: `Successfully notified the owner of server with ID ${serverId}`, ephemeral: true });
    }
}