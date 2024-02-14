const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admire')
        .setDescription('Admire someone anonymously! (or not)')
        .addUserOption(option => option.setName('target').setDescription('Person to admire').setRequired(true))
        .addStringOption(option => option.setName('message').setDescription('What would you say to the people you admire?').setRequired(true))
        .addBooleanOption(option => option.setName('anonymous').setDescription('True if you want to keep your admiration anonymous, False if not')),

    async execute(interaction) {

        const user = interaction.options.getUser('target');
        const admiration = interaction.options.getString('message');
        const isAnon = interaction.options.getBoolean('anonymous');
        const loventinesChannel = interaction.guild.channels.resolve('1207438180333256785');
        const logChannel = interaction.guild.channels.resolve('1109933749329731679');
        const time = Math.round(interaction.createdTimestamp / 1000);

        if (!loventinesChannel) return interaction.reply({ content: `The loventines channel is not set! Please contact Moe.`, ephemeral: true });

        let admireEmbed = new EmbedBuilder()
            .setColor(interaction.member.displayHexColor)
            .setAuthor({ name: "A new loventine was sent!", iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setFooter({ text: `If you have any questions about this feature, let Moe know.`, iconURL: interaction.guild.iconURL({ dynamic: true }) });

        if (isAnon) {
            admireEmbed.setDescription(`**Someone admires ${user}! Here's what they said about them.**\n\n${admiration}`);
            interaction.reply({ content: `Your admiration has been sent. **They don't know it was you.**`, ephemeral: true });
        }
        else if (!isAnon) {
            admireEmbed.setDescription(`**${interaction.user} admires ${user}! Here's what they said about them.**\n\n${admiration}`);
            interaction.reply({ content: `Your admiration has been sent. **They know it was you.**`, ephemeral: true });
        }

        loventinesChannel.send({ embeds: [admireEmbed], content: `${user}` })

        let logEmbed = new EmbedBuilder()
            .setAuthor({ name: `Logged a new Loventines Admiration`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .addFields([
                { name: `Admirer:`, value: `${interaction.user} (${interaction.user.id})`, inline: true },
                { name: `Recipient:`, value: `${user}`, inline: true },
                { name: `Sent at: `, value: `<t:${time}>`, inline: true },
                { name: `Content:`, value: admiration }
            ])
            .setFooter({ text: `By: TOHE`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        logChannel.send({ embeds: [logEmbed] });
        console.log(`${interaction.user.id} used the loventines command. They said it towards ${user.id} and the message said ${admiration}`);
    },
};