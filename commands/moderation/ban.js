const { SlashCommandBuilder } = require('discord.js');
const con = require('../../mysqlConn.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('A Ban Command'),
    async execute(interaction) {
        interaction.reply("Banned all the staff members!\n-# This will not actually ban anyone, it's just a test command. It will soon be updated to an actual ban command with logs.");
    }
}