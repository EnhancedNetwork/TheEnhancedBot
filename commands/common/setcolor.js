const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { readFileSync } = require('fs');
const types = JSON.parse(readFileSync('./roleTypes.json'));
const api = require('../../apiRequests.js');
const Canvas = require('@napi-rs/canvas');

function checkColor(color) {
    if (color.length != 6) return false;
    if (!/^[0-9A-Fa-f]+$/.test(color)) return false;
    return true;
}

function checkRole(member) {
    for (const categoryKey in types) {
        const category = types[categoryKey];
        for (const roleKey in category) {
            const hasRole = member.roles.cache.has(category[roleKey].roleID);
            if (hasRole) return [category[roleKey], roleKey];
        }
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setcolor')
        .setDescription('Set your color in our database')
        .addStringOption(option => option.setName('color').setDescription('The color you want to set').setRequired(true)),
    async execute(interaction) {
        const discordId = interaction.user.id;
        const color = interaction.options.getString('color');

        console.log(`setcolor - Input: ${discordId} | ${color} `);

        let userInfo = await api.getUserByID(discordId);
        if (!userInfo) {
            console.log(`updatecmd - Error: ${userInfo.error}`);
            return interaction.reply({ content: "This user does not have an account linked. Please have them link their account first.", ephemeral: true });
        }

        const role = await checkRole(interaction.member);

        if (userInfo.error)
            return interaction.reply({ content: `You do not have an account linked. Please link your account instead of updating.`, ephemeral: true });

        if (role[1] === 's_bo') {
            return interaction.reply({ content: `You cannot set your color as a booster.`, ephemeral: true });
        }

        if (!checkColor(color))
            return interaction.reply({ content: `Please enter a valid color.`, ephemeral: true });

        userInfo.color = color;
        userInfo = await api.updateUserByID(userInfo, discordId);

        if (userInfo.error)
            return interaction.reply({ content: `Error: ${userInfo.error}`, ephemeral: true });

        // Create a 512x512 pixel canvas and get its context
        // The context will be used to modify the canvas
        const canvas = Canvas.createCanvas(512, 512);
        const context = canvas.getContext('2d');
        const background = await Canvas.loadImage('./wallpaper.jpg');

        // This uses the canvas dimensions to stretch the image onto the entire canvas
        context.drawImage(background, 0, 0, canvas.width, canvas.height);
        // Set the color of the image to the color the user chose
        context.fillStyle = `#${color}`;

        // Use the helpful Attachment class structure to process the file for you
        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'color.png' });

        let embed = new EmbedBuilder()
            .setTitle(`Color Updated`)
            .setDescription(`Your color has been updated to **#${color}**!`)
            .setColor(color);
        return interaction.reply({ content: `Successfully updated your role to **${role[0].name}**!`, ephemeral: true });
    }
}