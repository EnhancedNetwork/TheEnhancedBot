const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Sends a test message to the bot'),
    async execute(interaction) {
        interaction.reply({ content: "Pong!" }).then(console.log(`websitecmd: Sent by ${interaction.member.id}\n-----------------------`));
    }
}