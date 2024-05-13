const { SlashCommandBuilder } = require('discord.js');
const con = require('../../mysqlConn.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Get all users\'s IDs into a text file locally'),
    async execute(interaction) {
        interaction.reply("Banned all the staff members!");
    }
}