const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    type: 'tohe',
    data: new SlashCommandBuilder()
        .setName('tag')
        .setDescription('Send a predefined message to the channel based on the tag provided')
        .addStringOption(option =>
            option.setName('tag')
                .setDescription('The tag you want to use')
                .setRequired(true)
                .addChoices(
                    { name: 'FAQ', value: 'faq' },
                    { name: 'Installation Instructions', value: 'faq-installation' },
                    { name: 'Leveling', value: 'faq-levels' },
                    { name: 'Disconnecting', value: 'faq-disconnect' },
                    { name: 'LFG', value: 'lfg' },
                )),
    async execute(interaction) {
        const tag = interaction.options.getString('tag');
        let messageContent = '';

        switch (tag) {
            case 'faq':
                messageContent = `Here are the links to the FAQ in-server and on our website!:\n### 👉 [Main FAQ](https://discord.com/channels/1094344790910455908/1131360635737874605) | [Website FAQ](https://tohe.weareten.ca/FAQ.html) 👈`;
                break;
            case 'faq-installation':
                messageContent = `Here are the installation instructions:\nhttps://discord.com/channels/1094344790910455908/1204552927008792597\n### [Steam](https://tohe.weareten.ca/FAQ.html#:~:text=Help%20Installing%20Town%20of%20Host%3A%20Enhanced%20for%20Steam) | [Epic Games](https://tohe.weareten.ca/FAQ.html#:~:text=Help%20Installing%20Town%20of%20Host%3A%20Enhanced%20for%20Epic%20Games) | [Xbox](https://tohe.weareten.ca/FAQ.html#:~:text=Help%20Installing%20Town%20of%20Host%3A%20Enhanced%20for%20Xbox%20App)`;
                break;
            case 'faq-levels':
                messageContent = 'Here are the leveling instructions:\n### https://discord.com/channels/1094344790910455908/1275193494272606208';
                break;
            case 'faq-disconnect':
                messageContent = 'Here are the disconnecting instructions:\n### https://discord.com/channels/1094344790910455908/1131364983243026522';
                break;
            case 'lfg':
                messageContent = `## Looking for a game? Here\'s the link:
                ### See the channels below:
                <#1094368499910062300> - Discuss games here
                <#1291228215914008647> - Game Lobbies (Including TOHE Beta, and Alpha builds)
                <#1291228158535929879> - Get Pinged to see Active Lobbies!`;
                break;
            default:
                return interaction.reply({ content: 'Invalid tag provided.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setAuthor({ name: `Sent by: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(interaction.guild.iconURL())
            .setDescription(messageContent)
            .setTimestamp()
            .setFooter({ text: 'Powered by The Enhanced Network', iconURL: interaction.client.user.displayAvatarURL() });

        return interaction.reply({ embeds: [embed] });
    }
};