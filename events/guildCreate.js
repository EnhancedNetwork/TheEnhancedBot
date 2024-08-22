const { fetchData, constructURL } = require('../API Functions/utils.js');
const { createGuild } = require('../API Functions/guilds.js');

module.exports = {
    name: 'guildCreate',
    async execute(guild) {
        try {
            console.log('Creating guild with ID:', guild.id);
            const response = await createGuild(guild.id);

            if (response.error) {
                console.error(`Failed to create guild ${guild.name}:`, response.error);
                return;
            }

            console.log(`Guild ${guild.name} created in the database.`);
        } catch (error) {
            console.error(`Error in guildCreate event: ${error.message}`);
        }
    }
}
