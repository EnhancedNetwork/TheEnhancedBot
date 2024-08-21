const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { readFileSync } = require('fs');
const types = JSON.parse(readFileSync('./roleTypes.json'));
const { getUserByID } = require(__dirname + '/../../API Functions/userinfo.js');

function checkRole(type) {
    for (const categoryKey in types) {
        const category = types[categoryKey];
        for (const roleKey in category) {
            if (roleKey === type) {
                return category[roleKey].name;
            }
        }
    }
}

module.exports = {
    type: 'tohe',
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Get info about your current linked account'),
    async execute(interaction) {
        console.log(`-----------------------\ninfocmd: Received by ${interaction.member.id}`);
        const discordId = interaction.user.id;
        let userInfo = await getUserByID(discordId);

        if (userInfo.error) {
            console.log(`infocmd: Command Cancelled ${userInfo.error}\n-----------------------`);
            return interaction.reply({ content: "You do not have an account linked. Please link your account first.", ephemeral: true });
        }

        if (userInfo.colorCmd == 'null') userInfo.colorCmd = null;
        if (userInfo.overhead_tag == 'null') userInfo.overhead_tag = null;
        if (userInfo.color == 'null') userInfo.color = null;
        const embed = new EmbedBuilder()
            .setTitle(`Info for ${interaction.user.username}`)
            .addFields(
                { name: "Friend Code", value: userInfo.friendcode, inline: true },
                { name: "Type", value: checkRole(userInfo.type), inline: true },
                { name: "Up Access", value: userInfo.isUP ? "✅" : "❌", inline: true },
                { name: "Is Developer", value: userInfo.isDev ? "✅" : "❌", inline: true },
                { name: "Color Command Access", value: userInfo.colorCmd ? "✅" : "❌", inline: true },
                { name: "Tag", value: userInfo.overhead_tag ? userInfo.overhead_tag : "None", inline: true },
                { name: "Want to change your subscription tier?", value: `Visit [your account settings](https://weareten.ca/account/) to change your subscription tier`},
            )
            .setColor(userInfo.color ? userInfo.color : interaction.member.displayHexColor)
            .setFooter({ text: "If you have any questions, please contact a developer." })
            .setTimestamp();

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
}