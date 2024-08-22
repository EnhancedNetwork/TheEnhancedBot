const { Events, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { getUserByID, updateUserByID } = require('../API Functions/profiles');
const { getGuild } = require('../API Functions/guilds');
const { devIDs } = require('../config.json');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            if (await checkPermissions(interaction, command)) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error executing ${interaction.commandName}`);
                console.error(error);
            }
        } else if (interaction.isButton()) {
            if (interaction.customId === 'toggle_admire_opt_in')
                return toggleAdmireOptIn(interaction);
            if (interaction.customId === 'approve_admire') {
                const admireChannel = interaction.guild.channels.resolve(settings.admireChannel);
                await admireChannel.send({ embeds: [embed], content: userField })
                    .then(() => console.log('admire: admiration approved and sent'))
                    .catch(error => console.error(`admire: ${error}`));
        
                const row = createDisabledButtons();
                await interaction.update({ content: 'Admiration approved and sent!', components: [row] });
            } 
            else if (interaction.customId === 'deny_admire') {
                const row = createDisabledButtons();
                await interaction.update({ content: 'Admiration denied.', components: [row] });
            }
            else if (interaction.customId === 'verification-CODE-button') {
                const code = await generateCode(interaction); // Make sure generateCode is defined elsewhere

                const responseModal = new ModalBuilder()
                    .setCustomId('verification-CODE-modal') // Unique ID for the modal
                    .setTitle(`Your verification code is: ${code}`) // Display the code to the user;

                const codeInput = new TextInputBuilder()
                    .setCustomId('verification-CODE-input') // Unique ID for the text input
                    .setLabel(`Enter the code in the title above!`) // Display the code to the user
                    .setPlaceholder('The code is cAsE sEnSiTiVe') // Placeholder text
                    .setMinLength(6)
                    .setMaxLength(6)
                    .setStyle(TextInputStyle.Short);

                const row = new ActionRowBuilder().addComponents(codeInput);
                responseModal.addComponents(row);

                interaction.member.code = code; // Store the code in the member object
                await interaction.showModal(responseModal);
            }
            else if (interaction.customId === 'verification-EMOJI-button')
                return interaction.reply({ content: 'You selected the emoji button!', ephemeral: true });
            else if (interaction.customId === 'verification-WHY-button') {
                const embed = new EmbedBuilder()
                    .setTitle('Why do I need to verify?')
                    .setDescription('Verification is required to ensure that you are a human and not a bot. This helps us prevent spam and keep the server safe for everyone.')
                    .setColor('#0099ff')
                    .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                    .setTimestamp()
                    .setThumbnail(interaction.guild.iconURL())
                    .addFields([
                        { name: 'What happens if I don\'t verify?', value: 'You will not be able to access the server until you complete the verification process.' },
                        { name: 'How do I verify?', value: 'Simply click one of the buttons above to start the verification process.' },
                        { name: 'What is Captcha Code? 🔑', value: 'You will be given a 6-character alphanumeric code to enter in a box.' },
                        { name: 'What is Captcha Emoji? 😄', value: 'You will be asked to react to a message with a specific emoji.' }
                    ]);
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

        } else if (interaction.isModalSubmit()) {
            if (interaction.customId === 'verification-CODE-modal') {
                const code = interaction.fields.getTextInputValue('verification-CODE-input');
                const member = interaction.member;

                console.log(member.code); // Log the stored code
                if (code === member.code) {
                    return interaction.reply({ content: 'Verification successful!', ephemeral: true });
                } else {
                    return interaction.reply({ content: 'Verification failed. Please try again.', ephemeral: true });
                }
            }
        }
    },
};

async function checkPermissions(interaction, command) {
    if (!command.type) return false;
    else if (devIDs.includes(interaction.user.id)) return false;
    else if (command.type === 'tohe') {
        if (interaction.user.id !== '800552171048927243') {
            console.log(`User ${interaction.user.id} attempted to use a TOHE command in the wrong server`);
            return interaction.reply({ content: "This command can only be used in [TOHE's Official Discord](https://discord.gg/tohe)", ephemeral: true });
        }
    }
    else if (command.type === 'admin') {
        const guildData = await getGuild(interaction.guildId);
        if (!guildData || guildData.error)
            return interaction.reply({ content: 'This server is not in the database. Please contact Moe.', ephemeral: true });
        else if (interaction.member.permissions.has('Administrator'))
            return false;
        else if (interaction.member.roles.cache.has(guildData.adminRole))
            return false;
        else return interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
    }
    else if (command.type === 'dev') {
        const discordId = interaction.user.id;
        if (!devIDs.includes(discordId)) {
            console.log(`User ${discordId} attempted to use a dev command`);
            return interaction.reply({ content: 'You are not allowed to use this command', ephemeral: true });
        }
    }
    else if (command.type === 'owner') {
        if (interaction.user.id !== '800552171048927243') {
            console.log(`User ${interaction.user.id} attempted to use an owner command`);
            return interaction.reply({ content: "You are not allowed to use this command", ephemeral: true });
        }
    }
}

async function toggleAdmireOptIn(interaction) {
    try {
        const user = interaction.user;
        const userData = await getUserByID(user.id);
        const newAdmireOptIn = !userData.admireOptIn;
        await updateUserByID({ admireOptIn: newAdmireOptIn }, user.id);

        const message = interaction.message;
        const existingEmbed = message.embeds[0];

        const fields = existingEmbed.fields;
        const admireFieldIndex = fields.findIndex(field => field.name === 'Admire Opt-In:');

        if (admireFieldIndex !== -1) {
            // Update the existing field
            fields[admireFieldIndex].value = newAdmireOptIn ? '**Yes**' : '**No**';
        } else {
            // If the field somehow doesn't exist, you can choose to log an error or handle it accordingly
            console.error('Admire Opt-In field not found in the embed.');
            return interaction.reply({ content: 'There was an issue updating the Admire Opt-In status.', ephemeral: true });
        }

        const admireButton = new ButtonBuilder()
            .setLabel('Toggle Admire Opt-In')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('toggle_admire_opt_in');

        const row = new ActionRowBuilder().addComponents(admireButton);

        await interaction.update({
            content: `Updated Admire Opt In to: **${newAdmireOptIn ? 'Yes' : 'No'}**`,
            embeds: [existingEmbed],
            components: [row],
        });
    } catch (error) {
        console.error('Error toggling Admire Opt-In:', error);
        await interaction.reply({ content: 'There was an error while toggling Admire Opt-In. Please try again later.', ephemeral: true });
    }
}

async function generateCode(interaction) {
    const user = interaction.user;
    const userData = await getUserByID(user.id);
    // Generate a random 6-character alphanumeric code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    }
    return code;
}

function createDisabledButtons() {
    const approveButton = new ButtonBuilder()
        .setCustomId('approve_admire')
        .setLabel('Approve')
        .setStyle(ButtonStyle.Success)
        .setDisabled(true);

    const denyButton = new ButtonBuilder()
        .setCustomId('deny_admire')
        .setLabel('Deny')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true);

    return new ActionRowBuilder().addComponents(approveButton, denyButton);
}