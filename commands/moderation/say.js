const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getGuild } = require('../../API Functions/guilds')

module.exports = {
    type: 'mod',
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Say a message')
        .addStringOption(option => option.setName('message').setDescription('The message to say').setRequired(true))
        .addChannelOption(option => option.setName('channel').setDescription('The channel to say the message in')),
    async execute(interaction) {
        const message = interaction.options.getString('message');
        const channel = interaction.options.getChannel('channel') ?? interaction.channel;
        await interaction.deferReply({ ephemeral: true, fetchReply: true });

        // Send the message in an embed
        let embed = new EmbedBuilder()
            .setTitle("This message was sent by a staff member")
            .setDescription(message)
            .setColor("#FF0000")
            .setTimestamp()
            .setFooter({ text: `The Enhanced Bot by TOHE` });
        let msg = await channel.send({ embeds: [embed] });
        await interaction.editReply({ content: "Done", ephemeral: true })
            .catch(console.error);

        // Log the command usage in a separate channel
        const guildData = await getGuild(interaction.guildId);
        const logChannel = interaction.guild.channels.cache.get(guildData.sayLogChannel);
        if (!logChannel)
            return console.error('say.js: Log channel not found');
        
        let logEmbed = new EmbedBuilder()
            .setTitle(interaction.member.displayName + " used /say")
            .setColor("#FF0000")
            .setTimestamp()
            .addFields([
                { name: "Channel:", value: `<#${interaction.channel.id}> - [Jump to message](${msg.url})`, inline: true },
                { name: "User:", value: `${interaction.user} (${interaction.user.id})`, inline: true },
                { name: "Message:", value: message, inline: false },
            ])
            .setFooter({ text: `User ID: ${interaction.user.id}` });
        await logChannel.send({ embeds: [logEmbed] });
    }
}