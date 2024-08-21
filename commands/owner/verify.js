const { SlashCommandBuilder } = require('discord.js');
const { ButtonStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder } = require('discord.js');
const { joinRole, devIDs } = require('../../config.json'); 

module.exports = {
    notReady: true,
    type: 'owner',
    data: new SlashCommandBuilder()
        .setName('testverify')
        .setDescription('Verify yourself!')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Ping a user if you want to show them the verification process.')),
    async execute(interaction) {
        // Create the action row with buttons
        const actionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('verification-CODE-button')
                .setLabel('Captcha Code')
                .setEmoji('🔑')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('verification-EMOJI-button')
                .setLabel('Captcha Emoji')
                .setEmoji('😄')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('verification-WHY-button')
                .setLabel('Why?')
                .setEmoji('❓')
                .setStyle(ButtonStyle.Secondary)
        );

        // Create the embed message
        const embed = new EmbedBuilder()
            .setTitle('Verify You Are a Human')
            .setDescription('Please select a method to verify. Access to the server will be granted upon verification.')
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
            .setColor('#0099ff')
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
            .setTimestamp()
            .setThumbnail(interaction.guild.iconURL());

        try {
            // Get the user to ping
            const userId = interaction.options.getUser('user');
            // Send the embed and action row to the channel
            await interaction.reply({
                content: userId ? `${userId} Read below to verify` : null,
                embeds: [embed],
                components: [actionRow],
            });
        } catch (error) {
            try {
                await interaction.reply({
                    content: "An error occurred while trying to send the verification message. Please try again later.",
                    ephemeral: true
                });
            } catch (err) {
                console.error(`${userId}: Failed to send error notification to the user. Error: ${err.message}`);
            }
        }
    },
};
