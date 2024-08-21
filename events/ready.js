const { Events } = require('discord.js');
const { fetchData, constructURL } = require('../API Functions/utils.js');
const { getAllGuilds } = require('../API Functions/guilds.js'); // Adjust the path if needed

module.exports = {
    name: Events.ClientReady,
    async execute(client) {
        try {
            // Set the bot's status and activity
            await client.user.setPresence({
                status: 'online',
                activities: [{ name: 'with the code', type: 'PLAYING' }]
            });

            // Fetch all guilds the bot is in
            await client.guilds.fetch();

            // Fetch all guilds from the database
            const allGuildsResponse = await getAllGuilds();

            // Check if the response contains an error
            if (allGuildsResponse.error) {
                console.error('Failed to fetch guilds:', allGuildsResponse.error);
                return;
            }

            // Create a list of promises for fetching data for all guilds
            const guildPromises = client.guilds.cache.map(async guild => {
                const { url } = constructURL('/guilds', {}, { guildID: guild.id });
                const options = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ guildID: guild.id })
                };
                try {
                    await fetchData(url, options);
                    // Get an invite link for a channel in the guild
					const channel = guild.channels.cache.first();
					if (channel) {
						const invite = await channel.createInvite({ maxAge: 0 });
						console.log(`Invite link for ${guild.name}: ${invite.url}`);
					}
                } catch (error) {
                    console.error(`Failed to create settings for ${guild.name}:`, error);
                }
            });

            // Wait for all promises to complete
            await Promise.all(guildPromises);

            // Log that the bot is ready and logged in
            console.log(`Ready! Logged in as ${client.user.tag}`);
        } catch (error) {
            console.error('Error during client ready event:', error);
        }
    },
};
