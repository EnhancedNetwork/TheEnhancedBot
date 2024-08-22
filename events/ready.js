const { Events } = require('discord.js');
const { fetchData, constructURL } = require('../API Functions/utils.js');
const { createGuild } = require('../API Functions/guilds.js'); // Adjust the path if needed

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        try {
            await client.user.setPresence({
                status: 'online',
                activities: [{ name: 'with the code', type: 'PLAYING' }]
            });

            console.log('Ready! Logged in as', client.user.tag);
        } catch (error) {
            console.error('Error during client ready event:', error);
        }
    },
};
