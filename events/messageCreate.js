const { Events } = require('discord.js');
const { getGuild } = require('../API Functions/guilds');

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot) return; // Ignore bot messages

        const guild = await getGuild(message.guild.id);

        // If the message is in the counting channel
        if (guild.countingChannel === message.channel.id) {
            // If the member is in the blacklist role, delete the message
            if (message.member.roles.cache.has(guild.countingBlacklistRole)) return message.delete();

            // Fetch the last few messages, including both bot and user messages
            const messages = await message.channel.messages.fetch({ limit: 5 });

            // Filter only the user messages (not bot messages)
            const validMessages = messages.filter(msg => !msg.author.bot);
            const lastMessage = validMessages.first();

            // Check for any bot messages indicating a counting failure
            const lastBotMessage = messages.find(msg => msg.author.bot && msg.content.includes('did not count correctly'));

            if (lastBotMessage) {
                const currentNumber = parseInt(message.content);

                if (currentNumber !== 1) {
                    return message.channel.send(`${message.author}, the counting has reset. Please start from 1.`);
                }

                message.react('✅');
                return;
            }

            if (!lastMessage) {
                if (parseInt(message.content) === 1) {
                    message.react('✅');
                } else {
                    return message.channel.send(`${message.author}, the counting should start at 1.`);
                }
                return;
            }

            const lastNumber = parseInt(lastMessage.content);
            if (isNaN(lastNumber)) {
                return message.channel.send('The last counted message was not a valid number. Please restart the counting from 1.');
            }

            const currentNumber = parseInt(message.content);
            if (isNaN(currentNumber)) {
                return message.channel.send(`${message.author}, your message is not a valid number! Please continue with the correct number.`);
            }

            if (currentNumber !== lastNumber + 1) {
                return message.channel.send(`${message.author} did not count correctly! The next number should've been ${lastNumber + 1}. Shame, shame, shame!`);
            }

            message.react('✅');
        }
    }
}