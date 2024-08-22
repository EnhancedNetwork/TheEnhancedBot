const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { getUserToken, sendRegenerateTokenRequest } = require('../../API Functions/tokens.js');
const { devIDs } = require('../../config.json');

module.exports = {
    type: 'dev',
    data: new SlashCommandBuilder()
        .setName('tokens')
        .setDescription('Get a user\'s token information')
        .addSubcommand(subcommand =>
            subcommand
                .setName('get')
                .setDescription('Get a user\'s token information')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to get the token information for')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName('id')
                        .setDescription('The ID of the token to get')
                        .setRequired(true)
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('regenerate')
                .setDescription('Regenerate a user\'s token')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to regenerate the token for')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('id')
                        .setDescription('The ID of the token to regenerate')
                        .setRequired(true)
                )),
    async execute(interaction) {
        const discordId = interaction.user.id;
        if (!devIDs.includes(discordId))
            return interaction.reply({ content: "You are not allowed to use this command", ephemeral: true });

        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser('user');
        const ID = interaction.options.getInteger('id');

        if (subcommand === 'get') {
            const response = await getUserToken(ID, user.id);
            if (response.error) {
                return interaction.reply({ content: `Error getting token: ${response.error}`, ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('Token Information')
                .setDescription(`**Token ID:** ${response.ID}\n**Owner ID:** ${response.ownerID}\n**Token:** ${response.token}\n**Active:** ${response.active}`)
                .setColor('Green');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (subcommand === 'regenerate') {
            const response = await sendRegenerateTokenRequest(ID, user.id);
            if (response.error) {
                return interaction.reply({ content: `Error regenerating token: ${response.error}`, ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('Token Regenerated (You will only see this once!)')
                .setDescription(`**Token ID:** ${response.ID}\n**Owner ID:** ${response.ownerID}\n**Token:** ${response.token}`)
                .setColor('Green');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
}