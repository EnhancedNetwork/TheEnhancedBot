const { SlashCommandBuilder } = require('discord.js');
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');
const con = require('../../mysqlConn.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Say a message')
        .addStringOption(option => option.setName('message').setDescription('The message to say').setRequired(true)),
    async execute(interaction) {
        console.log("Test")
        if(interaction.member.id != "800552171048927243") return interaction.editReply("You are not allowed to use this command");

        interaction.channel.send(interaction.options.getString('message'));
        interaction.reply({ content: "Done", ephemeral: true })
    }
}