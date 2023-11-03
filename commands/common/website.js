const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('website')
        .setDescription('Get the link to the Town of Host: Enhanced website'),
    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle("Town of Host: Enhanced")
            .setURL("https://tohre.dev")
            .setDescription("This is the official website for Town of Host: Enhanced.\nHere you can find the latest news, roles, and more!")
            .setFooter({ text: "Town of Host: Enhanced", iconURL: "https://i.ibb.co/RvX9B3s/Yeetus-TOHE-Pic.png" })
            .addFields(
                { name: "Need to Install TOHE?", value: "[Install Instructions](https://tohre.dev/GetStarted.html)", inline: true },
                { name: "Questions?", value: "[FAQ](https://tohre.dev/FAQ.html)", inline: true },
                { name: "Learn About the Mod!", value: "[Roles](https://tohre.dev/Roles.html)", inline: true },
                { name: "Learn About the Team!", value: "[About Us](https://tohre.dev/AboutUs.html)", inline: true },
                { name: "Want to support TOHE?", value: "[Check out our Ko-Fi!](https://ko-fi.com/tohen)", inline: true }
            )
            .setTimestamp();

        interaction.reply({ embeds: [embed] }).then(console.log(`websitecmd: Sent by ${interaction.member.id}\n-----------------------`));
    }
}