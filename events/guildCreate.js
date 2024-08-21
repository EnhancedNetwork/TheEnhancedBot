const { fetchData, constructURL } = require('../API Functions/utils.js');
const { createGuild } = require('../API Functions/guilds.js');

module.exports = {
    name: 'guildCreate',
    async execute(guild) {
        try {
            // Create a new guild in the database
            const response = await createGuild(guild.id);

            // Check if the response contains an error
            if (response.error) {
                console.error(`Failed to create guild ${guild.name}:`, response.error);
                return;
            }

            // Log that the guild was created
            console.log(`Guild ${guild.name} created in the database.`);
        } catch (error) {
            console.error(`Error in guildCreate event: ${error.message}`);
        }
    }
}