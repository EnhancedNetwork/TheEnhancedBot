const { Events, PermissionsBitField } = require('discord.js');
const { getGuild } = require('../API Functions/guilds');

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot) return;
        // Create counting channel system
        const guild = await getGuild(message.guild.id);
        if (guild.countingChannel === message.channel.id) {
            if (message.member.roles.cache.has(guild.countingBlacklistRole)) return message.delete();
            const lastMessage = await message.channel.messages.fetch({ limit: 2 });
            const lastNumber = parseInt(lastMessage.last().content);
            if (lastNumber + 1 !== parseInt(message.content)) {
                return message.channel.send(`${message.author} did not count correctly! The next number should've been ${lastNumber + 1}! Shame, shame, shame!`);
            }
            message.react('✅');
        }
    }
}