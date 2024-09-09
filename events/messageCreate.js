const { Events } = require('discord.js');
const { getGuild } = require('../API Functions/guilds');
let reset = false;

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot) return; // Ignore bot messages

        const guild = await getGuild(message.guild.id);

        if (guild.countingChannel === message.channel.id) {
            if (message.member.roles.cache.has(guild.countingBlacklistRole)) return message.delete();

            try {
                const messages = await message.channel.messages.fetch({ limit: 2, before: message.id });
                messages.forEach(element => {
                    console.log(element.content);
                });
                console.log('---');
                const validMessages = messages.filter(msg => !msg.author.bot);
                if (validMessages.size === 0) return; // No valid user messages before the current one

                const lastMessage = validMessages.first(); // The most recent valid user message before the current one
                const lastBotMessage = messages.find(msg => msg.author.bot && msg.content.includes('did not count correctly'));

                // If a reset was enforced by the bot, the next message must be "1"
                if (lastBotMessage && parseInt(message.content) == 1 && reset) {
                    message.react('✅');
                    return;
                }

                // Check if the last user message content is a valid number
                const lastNumber = parseInt(lastMessage.content);
                const currentNumber = parseInt(message.content);
                if (isNaN(lastNumber) || isNaN(currentNumber)) {
                    message.delete();
                    return message.channel.send(`${message.author}, please only count with numbers!`);
                }

                // Check if the current message is the correct next number in the sequence
                if (currentNumber !== lastNumber + 1) {
                    reset = true;
                    return message.channel.send(`${message.author} did not count correctly! The next number should've been ${lastNumber + 1}. Please start over from 1.`);
                }

                if (lastMessage.author.id === message.author.id) {
                    reset = true;
                    return message.channel.send(`${message.author}, did not count correctly! You cannot count twice in a row. Please start over from 1.`);
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
