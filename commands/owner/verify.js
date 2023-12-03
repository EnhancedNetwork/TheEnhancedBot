const { SlashCommandBuilder } = require('discord.js');
const { ButtonStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder } = require('discord.js');
const { joinRole } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('testverify')
        .setDescription('Verify yourself!'),
    execute: async (interaction) => {
        const uID = interaction.user.id;
        if (uID != "800552171048927243")
            return interaction.reply({ content: "You do not have permission to use this command", ephemeral: true });
        console.log(`${uID}: beginning command; Verify`);
        const row = new ActionRowBuilder().addComponents(
            // create a discord button
            new ButtonBuilder()
                .setCustomId('verification-CODE-button')
                .setLabel('Captcha Code')
                .setEmoji({ name: '🔑' })
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('verification-EMOJI-button')
                .setLabel('Captcha Emoji')
                .setEmoji({ name: '😄' })
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('verification-WHY-button')
                .setLabel('Why?')
                .setEmoji({ name: '❓' })
                .setStyle(ButtonStyle.Secondary)
        );

        let embed = new EmbedBuilder()
            .setTitle('Verify you are a Human')
            .setDescription(`Please select a method to verify. Access to the server will be granted upon verification.`)
            .setAuthor({ name: interaction.guild.name, url: interaction.guild.iconURL() })
            .setColor('#0099ff')
            .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
            .setTimestamp()
            .setThumbnail(interaction.guild.iconURL());

        interaction.channel.send({ content: "Verify Embed", embeds: [embed], components: [row] })
            .then(() => console.log(`${interaction.member.id}: (0) Verify; Verification sent`))
            .catch(err => console.log(`${interaction.member.id}: (0) Verify; Verification failed` + err));
    },
};