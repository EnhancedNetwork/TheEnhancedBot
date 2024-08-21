// This command is used to update a user's database entry with new information. This is an admin only command.
const { SlashCommandBuilder } = require('discord.js');
const { devIDs } = require('../../config.json');
const { updateUserByID, getUserByID } = require('../../API Functions/userinfo.js');

async function updateUserRole(type, value, user) {
    let updateData = {};
    let responseMessage = '';

    switch (type) {
        case 'tag':
            if (value.length > 50) return `**Overhead Tag too long (50 character limit):** \`${value}\`\n`;
            if (value.length < 1) return `**Overhead Tag too short (1 character minimum):** \`${value}\`\n`;
            updateData.overhead_tag = value;
            break;
        case 'color':
            if (value.length !== 6 || !value.match(/^[0-9a-fA-F]+$/)) return `**Invalid color, please use a 6 digit hex code WITHOUT the # (e.g. FF0000):** \`${value}\`\n`;
            updateData.color = value.toUpperCase();
            break;
        case 'isUp':
        case 'isDev':
        case 'colorCmd':
        case 'debug':
            updateData[type] = value ? 1 : 0;
            break;
        default:
            return `**Invalid update type:** \`${type}\`\n`;
    }

    try {
        const response = await updateUserByID(updateData, user.id);
        if (response.error) {
            responseMessage = `**Error updating ${type}:** \`${response.error}\`\n`;
        } else {
            responseMessage = `**Updated ${type}:** \`${value}\`\n`;
        }
    } catch (err) {
        console.log(`updatecmd - Error updating ${type} for ${user.id}: ${err}`);
        responseMessage = `**Error updating ${type}:** \`${err}\`\n`;
    }

    return responseMessage;
}

module.exports = {
    type: 'dev',
    data: new SlashCommandBuilder()
        .setName('adminupdate')
        .setDescription('Update a database entry for a user (Admin Only)')
        .addUserOption(option => option.setName('user').setDescription('The user to update').setRequired(true))
        .addStringOption(option => option.setName('overhead_tag').setDescription('The tag to set for the user'))
        .addStringOption(option => option.setName('color').setDescription('The color to set for the user'))
        .addBooleanOption(option => option.setName('up').setDescription('Whether or not the user has up access'))
        .addBooleanOption(option => option.setName('dev').setDescription('Whether or not the user has dev access'))
        .addBooleanOption(option => option.setName('colorcmd').setDescription('Whether or not the user has color command access'))
        .addBooleanOption(option => option.setName('debug').setDescription('Whether or not the user has debug access')),

    async execute(interaction) {
        const discordId = interaction.user.id;
        if (!devIDs.includes(discordId))
            return interaction.reply({ content: "You are not allowed to use this command", ephemeral: true });

        const user = interaction.options.getMember('user');
        const overhead_tag = interaction.options.getString('overhead_tag');
        const color = interaction.options.getString('color');
        const up = interaction.options.getBoolean('up');
        const dev = interaction.options.getBoolean('dev');
        const colorcmd = interaction.options.getBoolean('colorcmd');
        const debug = interaction.options.getBoolean('debug');

        console.log(`updatecmd - Input: ${user.id} | ${overhead_tag} | ${color} | ${up} | ${dev} | ${colorcmd} | ${debug}`);

        let userInfo = await getUserByID(user.id);
        if (!userInfo || userInfo.error)
            return interaction.reply({ content: "This user does not have an account linked. Please have them link their account first.", ephemeral: true });

        let finalResult = "";
        if (overhead_tag) finalResult += await updateUserRole('tag', overhead_tag, user);
        if (color) finalResult += await updateUserRole('color', color, user);
        if (up !== null) finalResult += await updateUserRole('isUp', up, user);
        if (dev !== null) finalResult += await updateUserRole('isDev', dev, user);
        if (colorcmd !== null) finalResult += await updateUserRole('colorCmd', colorcmd, user);
        if (debug !== null) finalResult += await updateUserRole('debug', debug, user);

        return interaction.reply({ content: `Successfully updated ${user}!\n${finalResult}`, ephemeral: true });
    }
};
