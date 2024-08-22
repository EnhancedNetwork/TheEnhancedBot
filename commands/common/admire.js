const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getGuild } = require('../../API Functions/guilds');
const { getUserByID } = require('../../API Functions/profiles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admire')
        .setDescription('Admire someone anonymously! (or not)')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Person to admire')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('What would you say to the people you admire?')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('anonymous')
                .setDescription('True if you want to keep your admiration anonymous, False if not')),

    async execute(interaction) {
        try {
            const settings = await getGuild(interaction.guild.id);
            if (!settings) {
                return await interaction.reply({
                    content: 'The guild settings are not set up. Please contact Moe to set them up.',
                    ephemeral: true,
                }).then(() => console.log('admire: guild settings not set up'))
                    .catch(error => console.error(`admire: ${error}`));
            }

            const user = interaction.options.getUser('target');
            const admiration = interaction.options.getString('message');
            const isAnon = interaction.options.getBoolean('anonymous');
            const admireChannel = interaction.guild.channels.resolve(settings.admireChannel);
            const logChannel = interaction.guild.channels.resolve(settings.admireLogChannel);
            const time = Math.floor(Date.now() / 1000);

            if (!admireChannel) {
                return await interaction.reply({
                    content: 'The admire channel is not set up. Please contact a server manager.',
                    ephemeral: true,
                }).then(() => console.log('admire: admire channel not set up'))
                    .catch(error => console.error(`admire: ${error}`));
            }

            if (!interaction.member.roles.cache.has(settings.admireRole)) {
                return await interaction.reply({
                    content: 'You do not have permission to use this command.',
                    ephemeral: true,
                }).then(() => console.log('admire: user does not have permission'))
                    .catch(error => console.error(`admire: ${error}`));
            }

            const userSettings = await getUserByID(user.id);
            if (!userSettings.result && !userSettings.admireOptIn) {
                return await interaction.reply({
                    content: `The person you're trying to admire has not opted in to receive admirations.`,
                    ephemeral: true,
                }).then(() => console.log('admire: user has not opted in'))
                    .catch(error => console.error(`admire: ${error}`));
            }

            if (interaction.user.id === user.id) {
                return await interaction.reply({
                    content: `You can't admire yourself you silly goose!`,
                    ephemeral: true,
                }).then(() => console.log('admire: user tried to admire themselves'))
                    .catch(error => console.error(`admire: ${error}`));
            }

            const admireEmbed = createAdmireEmbed(interaction, user, admiration, isAnon);
            const logEmbed = createLogEmbed(interaction, user, admiration, time);

            if (settings.admireVerifyByStaff) {
                // Send the admiration to the log channel for verification
                const approveButton = new ButtonBuilder()
                    .setCustomId('approve_admire')
                    .setLabel('Approve')
                    .setStyle(ButtonStyle.Success);

                const denyButton = new ButtonBuilder()
                    .setCustomId('deny_admire')
                    .setLabel('Deny')
                    .setStyle(ButtonStyle.Danger);

                const row = new ActionRowBuilder().addComponents(approveButton, denyButton);

                await logChannel.send({
                    content: `New admiration awaiting approval:`,
                    embeds: [logEmbed],
                    components: [row],
                }).then(() => console.log('admire: sent to log channel for approval'))
                    .catch(error => console.error(`admire: ${error}`));

                await interaction.reply({
                    content: 'Your admiration is awaiting staff approval.',
                    ephemeral: true,
                }).then(() => console.log('admire: informed user of pending approval'))
                    .catch(error => console.error(`admire: ${error}`));
            } else {
                // Directly send the admiration to the admire channel
                await admireChannel.send({ embeds: [admireEmbed], content: `${user}` })
                    .then(() => console.log('admire: sent the admiration'))
                    .catch(error => console.error(`admire: ${error}`));

                await logChannel.send({ embeds: [logEmbed] })
                    .then(() => console.log('admire: logged the admiration'))
                    .catch(error => console.error(`admire: ${error}`));

                await interaction.reply({
                    content: isAnon
                        ? `Your admiration has been sent. **They don't know it was you.**`
                        : `Your admiration has been sent. **They know it was you.**`,
                    ephemeral: true,
                }).then(() => console.log('admire: replied to the user'))
                    .catch(error => console.error(`admire: ${error}`));
            }

            console.log(`admire: ${interaction.user.tag} admired ${user.tag} at ${time}`);
        } catch (error) {
            console.error(`Error in admire command: ${error}`);
            await interaction.reply({
                content: 'An error occurred while processing your admiration. Please try again later. If the issue persists, please join our support server.',
                ephemeral: true,
            });
        }
    }
};

function createAdmireEmbed(interaction, user, admiration, isAnon) {
    const embed = new EmbedBuilder()
        .setColor(interaction.member.displayHexColor)
        .setAuthor({ name: 'A new admire was sent!', iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setFooter({ text: 'If you have any questions about this feature, let Moe know.', iconURL: interaction.guild.iconURL({ dynamic: true }) });

    const description = isAnon
        ? `**Someone admires ${user}! Here's what they said about them.**\n\n${admiration}`
        : `**${interaction.user} admires ${user}! Here's what they said about them.**\n\n${admiration}`;

    return embed.setDescription(description);
}

function createLogEmbed(interaction, user, admiration, time) {
    return new EmbedBuilder()
        .setAuthor({ name: 'Logged a new Admiration', iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .addFields([
            { name: 'Admirer:', value: `${interaction.user} (${interaction.user.id})`, inline: true },
            { name: 'Recipient:', value: `${user}`, inline: true },
            { name: 'Sent at:', value: `<t:${time}>`, inline: true },
            { name: 'Content:', value: admiration },
        ])
        .setFooter({ text: 'By The Enhanced Network @ discord.gg/tohe', iconURL: interaction.guild.iconURL({ dynamic: true }) });
}
