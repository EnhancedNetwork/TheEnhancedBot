const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { updateGuild, getGuild } = require('../../API Functions/guilds');

module.exports = {
    type: 'admin',
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Manage server settings')
        .addSubcommand(subcommand => subcommand
            .setName('update')
            .setDescription('Update a setting')
            .addStringOption(option =>
                option.setName('setting')
                    .setDescription('The setting to update')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Admire Channel', value: 'admireChannel' },
                        { name: 'Admire Role', value: 'admireRole' },
                        { name: 'Admire Log Channel', value: 'admireLogChannel' },
                        { name: 'Admin Role', value: 'adminRole' },
                        { name: 'Mod Role', value: 'modRole' },
                        { name: 'Say Command Log Channel', value: 'sayLogChannel' },
                        { name: 'Counting Channel', value: 'countingChannel' },
                        { name: 'Counting Blacklist Role', value: 'countingBlacklistRole' }
                    )
            )
            .addStringOption(option =>
                option.setName('value')
                    .setDescription('The new value')
                    .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('view')
            .setDescription('View the current settings')
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        const guildData = await getGuild(interaction.guild.id);
        if (guildData.error) 
            return interaction.reply({ content: 'An error occurred while fetching guild data. Please contact Moe.', ephemeral: true });

        console.log(guildData);
        try {
            if (subcommand === 'update') {
                console.log('settings.js: update');
                await updateSettings(interaction, guildData);
            } else if (subcommand === 'view') {
                await viewSettings(interaction, guildData);
            } else {
                await interaction.reply({ content: 'Invalid subcommand', ephemeral: true });
            }
        } catch (error) {
            console.error('Error executing command:', error);
            await interaction.reply({ content: 'An error occurred while executing the command. Please contact Moe.', ephemeral: true });
        }
    }
};

async function viewSettings(interaction, guildData) {
    const { member, guild } = interaction;

    const settingsEmbed = new EmbedBuilder()
        .setColor(member.displayHexColor)
        .setAuthor({ name: `Settings for ${guild.name}`, iconURL: guild.iconURL({ dynamic: true }) })
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setFooter({ text: 'If you have any questions about this feature, let Moe know.', iconURL: guild.iconURL({ dynamic: true }) });

    Object.entries(guildData).forEach(([key, value]) => {
        if (!['ID', 'guildID'].includes(key)) {
            settingsEmbed.addFields({
                name: formatKey(key),
                value: checkInput(interaction, key, value).stringified || 'Not set',
                inline: true
            });
        }
    });

    return interaction.reply({ embeds: [settingsEmbed], ephemeral: true });
}

async function updateSettings(interaction, gData) {
    const { options } = interaction;
    const setting = options.getString('setting');
    const value = formatValue(options.getString('value'));

    const { stringified, valid } = checkInput(interaction, setting, value);
    if (!valid) {
        return interaction.reply({ content: `${value} is not valid for the setting: ${formatKey(setting)}. Please try again.`, ephemeral: true });
    }

    // Update only the relevant setting
    const updatedData = {
        guildID: gData.guildID,
        [setting]: value
    };

    const response = await updateGuild(updatedData);

    if (response && !response.error) {
        return interaction.reply({ content: `Successfully updated the ${formatKey(setting)} setting to ${stringified}.`, ephemeral: true });
    } else {
        return interaction.reply({ content: 'An error occurred while updating the setting. Please contact moe.dev', ephemeral: true });
    }
}

function checkInput(interaction, setting, value) {
    const { guild } = interaction;
    const isRole = setting.toLowerCase().includes('role');
    const isChannel = setting.toLowerCase().includes('channel');

    if (isRole && guild.roles.cache.has(value)) {
        return { stringified: `<@&${value}>`, valid: true };
    } else if (isChannel && guild.channels.cache.has(value)) {
        return { stringified: `<#${value}>`, valid: true };
    } else {
        return { stringified: value, valid: false };
    }
}

function formatKey(key) {
    return key.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function formatValue(value) {
    return value.replace(/<@&|<#|>/g, '');
}
