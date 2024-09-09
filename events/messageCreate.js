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
            const lastMessage = validMessages.last();

            // Check for any bot messages indicating a counting failure
            const lastBotMessage = messages.find(msg => msg.author.bot && msg.content.includes('did not count correctly'));

            // If the last bot message indicates failure, the next message should start at 1
            if (lastBotMessage) {
                const currentNumber = parseInt(message.content);

                // If the user message is not 1 after failure, reset the count
                if (currentNumber !== 1) {
                    return message.channel.send(`${message.author}, the counting has reset. Please start from 1.`);
                }

                // If the user starts from 1 correctly, react and proceed
                message.react('✅');
                return;
            }

            // If no previous valid messages exist, expect the current message to be 1
            if (!lastMessage) {
                if (parseInt(message.content) === 1) {
                    message.react('✅');
                } else {
                    return message.channel.send(`${message.author}, the counting should start at 1.`);
                }
                return;
            }

            // Check if the last message content is a valid number
            const lastNumber = parseInt(lastMessage.content);
            if (isNaN(lastNumber)) {
                return message.channel.send('The last counted message was not a valid number. Please restart the counting from 1.');
            }

            // Parse the current message content as a number
            const currentNumber = parseInt(message.content);
            if (isNaN(currentNumber)) {
                return message.channel.send(`${message.author}, your message is not a valid number! Please continue with the correct number.`);
            }

            // Check if the current message is the correct next number
            if (currentNumber !== lastNumber + 1) {
                return message.channel.send(`${message.author} did not count correctly! The next number should've been ${lastNumber + 1}. Shame, shame, shame!`);
            }

            // React with a checkmark if the counting is correct
            message.react('✅');
        }
    }
}