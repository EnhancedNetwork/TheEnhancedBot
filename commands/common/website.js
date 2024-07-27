const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('website')
        .setDescription('Get the link to the Town of Host: Enhanced website'),
    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle("Town of Host: Enhanced")
            .setURL("https://tohe.weareten.ca/")
            .setDescription("This is the official website for Town of Host: Enhanced.\nHere you can find the latest news, roles, and more!")
            .setFooter({ text: "Town of Host: Enhanced", iconURL: "https://i.ibb.co/RvX9B3s/Yeetus-TOHE-Pic.png" })
            .addFields(
                { name: "Need to Install TOHE?", value: "[Install Instructions](https://tohe.weareten.ca/Install.html)", inline: true },
                { name: "Questions?", value: "[FAQ](https://tohe.weareten.ca/FAQ.html)", inline: true },
                { name: "Learn About the Mod!", value: "[Roles](https://tohe.weareten.ca/Roles.html)", inline: true },
                { name: "Learn About the Team!", value: "[About Us](https://tohe.weareten.ca/AboutUs.html)", inline: true },
                { name: "Want to support TOHE?", value: "[Purchase a Package!](https://weareten.ca/TOHE/)", inline: true }
            )
            .setTimestamp();

        interaction.reply({ embeds: [embed] }).then(console.log(`websitecmd: Sent by ${interaction.member.id}\n-----------------------`));
    }
}
