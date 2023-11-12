const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const con = require('../../mysqlConn.js');
const { readFileSync } = require('fs');
const types = JSON.parse(readFileSync('./roleTypes.json'));

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
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Get info about your current linked account'),
    async execute(interaction) {
        const discordId = interaction.user.id;
        let userInfo = await con.check(`SELECT * FROM role_table WHERE userID = '${discordId}'`);
        userInfo = userInfo[0];

        if (!userInfo)
            return interaction.reply({ content: "You do not have an account linked. Please link your account first.", ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle(`Info for ${interaction.user.username}`)
            .addFields(
                { name: "Friend Code", value: userInfo.friendcode, inline: true },
                { name: "Type", value: checkRole(userInfo.type), inline: true },
                { name: "Up Access", value: userInfo.isUP ? "✅" : "❌", inline: true },
                { name: "Is Developer", value: userInfo.isDev ? "✅" : "❌", inline: true },
                { name: "Color Command Access", value: userInfo.isColor ? "✅" : "❌", inline: true },
                { name: "Tag", value: userInfo.overhead_tag ? userInfo.overhead_tag : "None", inline: true },
                { name: "Want to change your subscription tier?", value: `Visit [your account settings](https://ko-fi.com/tohen) to change your subscription tier]`},
            )
            .setColor(userInfo.color ? userInfo.color : interaction.member.displayHexColor)
            .setFooter({ text: "If you have any questions, please contact a developer." })
            .setTimestamp();

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
}