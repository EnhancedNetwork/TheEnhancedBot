const { createGuild } = require('../../API Functions/guilds.js');
const { fetchData, constructURL } = require('../../API Functions/utils.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    type: 'dev',
    data: new SlashCommandBuilder()
        .setName('generate-server-settings')
        .setDescription('Generate server settings for a guild'),

    async execute(interaction) {
        try {
            const client = interaction.client;
            let guildsCreated = 0;
            let guildsFailed = 0;
            let guildInviteCount = 0;

            await client.guilds.fetch();

            const guildPromises = client.guilds.cache.map(async guild => {
                const guildData = await createGuild(guild.id);
                if (guildData.error) {
                    guildsFailed++;
                    console.error(`Failed to create guild ${guild.name}:`, guildData.error);
                    return;
                }
                guildsCreated++;
            });

            // Wait for all promises to complete
            await Promise.all(guildPromises);

            // Log that the bot is ready and logged in
            console.log(`Guilds created: ${guildsCreated}`);
            console.log(`Guilds failed: ${guildsFailed}`);
            console.log(`Guild invites fetched: ${guildInviteCount}`);
        } catch (error) {
            
        }
    }
}