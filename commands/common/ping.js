const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Sends a test message to the bot'),
    async execute(interaction) {
        interaction.reply({ content: "Pong!", ephemeral: true }).then(console.log(`pingcmd: Sent by ${interaction.member.id}\n-----------------------`));
    }
}