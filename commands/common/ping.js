const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Sends a test message to the bot'),
    async execute(interaction) {
        console.log(`-----------------------\npingcmd: Received by ${interaction.member.id}`);
        interaction.reply({ content: "Pong!", ephemeral: true })
        .then(console.log(`pingcmd: Sent by ${interaction.member.id}\n-----------------------`))
        .catch(err => console.log(`pingcmd: Error: ${err}\n-----------------------`));
    }
}