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

            try {
                // Fetch messages BEFORE the current message to avoid including the current message in the check
                const messages = await message.channel.messages.fetch({ limit: 10, before: message.id });

                // Filter out bot messages and only consider user messages
                const validMessages = messages.filter(msg => !msg.author.bot);
                const lastMessage = validMessages.first(); // The most recent valid user message before the current one

                // Track if a reset has been enforced
                let resetEnforced = false;

                // Check if the last bot message indicates a reset was required (due to a previous failure)
                const lastBotMessage = messages.find(msg => msg.author.bot && msg.content.includes('Please start over from 1'));

                // If a reset was enforced by the bot, the next message must be "1"
                if (lastBotMessage && parseInt(message.content) !== 1) {
                    return message.channel.send(`${message.author}, the counting has been reset. Please start from 1.`);
                }

                // If no previous valid messages exist, expect the counting to start at 1
                if (!lastMessage) {
                    if (parseInt(message.content) === 1) {
                        message.react('✅');
                    } else {
                        return message.channel.send(`${message.author}, the counting should start at 1.`);
                    }
                    return;
                }

                // Check if the last user message content is a valid number
                const lastNumber = parseInt(lastMessage.content);
                if (isNaN(lastNumber)) {
                    return message.channel.send(`${message.author}, the last message was not a valid number! Please start the counting over from 1.`);
                }

                // Parse the current message content as a number
                const currentNumber = parseInt(message.content);
                if (isNaN(currentNumber)) {
                    return message.channel.send(`${message.author}, please only count with numbers!`);
                }

                // Check if the current message is the correct next number in the sequence
                if (currentNumber !== lastNumber + 1) {
                    resetEnforced = true;
                    return message.channel.send(`${message.author} did not count correctly! The next number should've been ${lastNumber + 1}. Please start over from 1.`);
                }

                // If counting is correct, react with a checkmark
                message.react('✅');

            } catch (error) {
                console.error('Error processing message:', error);
                return message.channel.send('There was an error processing the counting system. Please try again.');
            }
        }
    }
}
