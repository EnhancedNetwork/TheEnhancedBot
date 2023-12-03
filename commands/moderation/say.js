const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');
const con = require('../../mysqlConn.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Say a message')
        .addStringOption(option => option.setName('message').setDescription('The message to say').setRequired(true))
        .addChannelOption(option => option.setName('channel').setDescription('The channel to say the message in')),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has('1180344568152076331'))
            return interaction.reply({ content: "You do not have permission to use this command", ephemeral: true });

        const message = interaction.options.getString('message');
        const channel = interaction.options.getChannel('channel') ? interaction.options.getChannel('channel') : interaction.channel;
        // Log the command usage in a separate channel
        const logChannel = interaction.guild.channels.cache.get('1122232494402580490');
        let logEmbed = new EmbedBuilder()
            .setTitle(interaction.member.displayName + " used /say")
            .setColor("#FF0000")
            .setTimestamp()
            .addFields([
                { name: "Channel:", value: `<#${interaction.channel.id}>`, inline: true },
                { name: "User:", value: `${interaction.user} (${interaction.user.id})`, inline: true },
                { name: "Message:", value: message, inline: false },
            ])
            .setFooter({ text: `User ID: ${interaction.user.id}` });
        await logChannel.send({ embeds: [logEmbed] });

        // Send the message in an embed
        let embed = new EmbedBuilder()
            .setTitle("This message was sent by a staff member")
            .setDescription(message)
            .setColor("#FF0000")
            .setTimestamp()
            .setFooter({ text: `Town of Mods by TOHE` });
        await channel.send({ embeds: [embed] });
        await interaction.reply({ content: "Done", ephemeral: true })
    }
}