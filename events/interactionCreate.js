const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
let { joinRole } = require('../config.json');

function makeid(length) {
    var result = ['', ''];
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        let letter = characters.charAt(Math.floor(Math.random() * charactersLength));
        result[0] += letter + " ";
        result[1] += letter;
    }
    return result;
}

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {

        if (interaction.isCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
                return;
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
            return;
        }
        if (interaction.customId == 'verification-EMOJI-button') {
            console.log("In here");
        }
        if (interaction.customId === 'verification-CODE-button') {
            const code = makeid(7);
            const row = new ActionRowBuilder().addComponents(
                // create a discord button
                new ButtonBuilder()
                    .setCustomId('verification-GENERATE-button')
                    .setLabel('Click to Submit Code to Verify you are a Human')
                    .setEmoji({ name: '✅' })
                    .setStyle(ButtonStyle.Danger)
            );

            let embed = new EmbedBuilder()
                .setTitle('Verification')
                .setDescription(`Please enter the code below to verify your account.`)
                .setAuthor({ name: interaction.user.username, url: interaction.user.avatarURL() })
                .setColor('#0099ff')
                .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
                .setTimestamp()
                .setThumbnail(interaction.user.avatarURL())
                .addFields({ name: 'Code', value: code[0] });

            interaction.reply({ content: 'Verification Embed', embeds: [embed], components: [row], ephemeral: true });
            interaction.member.code = code[1];
        }
        if (interaction.customId === 'verification-GENERATE-button') {
            // Create our modal
            const modal = new ModalBuilder()
                .setCustomId('myModal')
                .setTitle('My Modal');

            // Add components to modal
            // Let's create our text inputs
            const codeInput = new TextInputBuilder()
                .setCustomId('codeInput')
                .setLabel("What is the code that is displayed?")
                .setStyle(TextInputStyle.Short);

            const firstActionRow = new ActionRowBuilder().addComponents(codeInput);

            modal.addComponents(firstActionRow);

            // Show our modal
            await interaction.showModal(modal);
        }
        if (interaction.customId === 'verification-WHY-button') {
            let embed = new EmbedBuilder()
                .setTitle('Why do I need to verify?')
                .setDescription(`Verification is required to prevent spam and bots from joining the server. This helps us keep the server clean and safe.`)
                .setAuthor({ name: interaction.guild.name, url: interaction.guild.iconURL() })
                .setColor('#0099ff')
                .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
                .setTimestamp()
                .setThumbnail(interaction.guild.iconURL());

            interaction.reply({ content: 'Verification Embed', embeds: [embed], ephemeral: true });
        }
        if (interaction.isModalSubmit()) {
            const codeInput = interaction.fields.getTextInputValue('codeInput');
            console.log(`${interaction.member.id}: (0) Verify; Code: ${codeInput}`);
            if (codeInput === interaction.member.code) {
                interaction.member.roles.add(joinRole);
                interaction.reply({ content: 'You have been verified!', ephemeral: true });
            } else {
                interaction.reply({ content: 'Incorrect code!', ephemeral: true });
            }
        }
    }
}