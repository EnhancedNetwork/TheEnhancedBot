const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const api = require('../../apiRequests.js');

function checkCode(code) {
    if (code.substring(code.length - 5, code.length - 4) !== "#") return false;
    if (!code.substring(code.length - 4, code.length).match(/^[0-9]+$/)) return false;
    return code.replace('#', '%23');
}

async function findUser(friendCode, hashPUID) {
    if (friendCode) {
        friendCode = friendCode.replace('#', '%23');
        let result = await api.getUserByFriendCode(friendCode);
        console.log(result);
        if (result.name) return result;
    }
    if (hashPUID) {
        let result = await api.getUserByHashPUID(hashPUID);
        if (result.name) return result;
    }
    return null;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eac')
        .setDescription('Manage EAC ban list')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a user to the EAC ban list')
                .addStringOption(option => option.setName('name').setDescription('The name of the user to ban').setRequired(true))
                .addStringOption(option => option.setName('reason').setDescription('The reason for the ban').setRequired(true)
                    .setMinLength(5).setMaxLength(100))
                .addStringOption(option => option.setName('friendcode').setDescription('The friend code of the user to ban')
                    .setMinLength(10).setMaxLength(30))
                .addStringOption(option => option.setName('hashpuid')
                    .setDescription('The hash PUID of the user to ban')
                    .setMinLength(9).setMaxLength(9)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a user from the EAC ban list')
                .addStringOption(option => option.setName('friendcode').setDescription('The friend code of the user to unban')
                    .setMinLength(10).setMaxLength(30))
                .addStringOption(option => option.setName('hashpuid').setDescription('The hash PUID of the user to unban')
                    .setMinLength(9).setMaxLength(9)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all banned users'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('search')
                .setDescription('Search for a banned user')
                .addStringOption(option => option.setName('friendcode').setDescription('The friend code of the user to search for')
                    .setMinLength(10).setMaxLength(30))
                .addStringOption(option => option.setName('hashpuid').setDescription('The hash PUID of the user to search for')
                    .setMinLength(9).setMaxLength(9))),
    async execute(interaction) {
        // Check if user has devID from config.json
        const discordId = interaction.user.id;
        if (!config.devIDs.includes(discordId))
            return interaction.reply({ content: "You are not allowed to use this command", ephemeral: true });

        const friendCode = interaction.options.getString('friendcode');
        const hashPUID = interaction.options.getString('hashpuid');
        const name = interaction.options.getString('name');
        const reason = interaction.options.getString('reason');

        if (interaction.options.getSubcommand() === 'list') {
            let result = await api.getAllUsers();
            let playerEmbeds = [];
            let embed = new EmbedBuilder()
                .setTitle("List of banned users")
                .setColor("FF0000")
                .setFooter({ text: `EAC Ban List - Page 1` })
                .setDescription(`\\# - Name - Friend Code - Hash PUID`);
            if (!result || result.error)
                return interaction.reply({ content: "Error: " + result.error, ephemeral: true });
            for (let i = 0; i < result.length; i++) {
                let player = result[i];
                embed.addFields(
                    {
                        name: player.name,
                        value: `${player.friendcode === "null" ? "N/A" : player.friendcode} - ${player.hashPUID === "null" ? "N/A" : player.hashPUID}\n${player.reason}`,
                        inline: true
                    }
                );
                if (i % 24 === 0 && i !== 0) {
                    playerEmbeds.push(embed);
                    embed = new EmbedBuilder()
                        .setTitle("List of banned users")
                        .setColor("FF0000")
                        .setFooter({ text: `EAC Ban List - Page ${playerEmbeds.length + 1}` })
                        .setDescription(`\\# - Name - Friend Code - Hash PUID`);
                }
            }
            playerEmbeds.push(embed);
            return interaction.reply({ embeds: playerEmbeds, ephemeral: true });
        }

        if (interaction.options.getSubcommand() === 'search') {
            if (!friendCode && !hashPUID)
                return interaction.reply({ content: "You must provide at least one of the following: friend code, hash PUID", ephemeral: true });

            // Check if friend code is valid
            if (friendCode && !checkCode(friendCode))
                return interaction.reply({ content: "Invalid friend code", ephemeral: true });

            let result = await findUser(friendCode, hashPUID);
            if (!result)
                return interaction.reply({ content: "No user found with that friend code or hash PUID", ephemeral: true });
            let embed = new EmbedBuilder()
                .setTitle(`Info for ${result.name}`)
                .addFields(
                    { name: "Friend Code", value: result.friendcode === "null" ? "N/A" : result.friendcode, inline: true },
                    { name: "Hash PUID", value: result.hashPUID === "null" ? "N/A" : result.hashPUID, inline: true },
                    { name: "Reason", value: result.reason, inline: true },
                )
                .setColor("FF0000")
                .setFooter({ text: "EAC Ban List" })
                .setTimestamp();
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        if (interaction.options.getSubcommand() === 'remove') {
            if (!friendCode && !hashPUID)
                return interaction.reply({ content: "You must provide at least one of the following: friend code, hash PUID", ephemeral: true });

            // Check if friend code is valid
            if (friendCode && !checkCode(friendCode))
                return interaction.reply({ content: "Invalid friend code", ephemeral: true });

            let result = await findUser(friendCode, hashPUID);
            if (!result)
                return interaction.reply({ content: "No user found with that friend code or hash PUID", ephemeral: true });

            result = await api.unban({ friendcode: friendCode.replace('#', '%23'), hashPUID: result.hashPUID });
            if (result.message !== "User removed successfully")
                return interaction.reply({ content: "Error: " + result.message, ephemeral: true });
            else
                return interaction.reply({ content: "Successfully removed user from EAC ban list", ephemeral: true });
        }
        if (interaction.options.getSubcommand() === 'add') {
            if (!friendCode && !hashPUID)
                return interaction.reply({ content: "You must provide at least one of the following: friend code, hash PUID", ephemeral: true });

            // Check if friend code is valid
            if (friendCode && !checkCode(friendCode))
                return interaction.reply({ content: "Invalid friend code", ephemeral: true });

            // Add user to EAC ban list
            let result = await api.ban({
                friendcode: friendCode,
                hashPUID: hashPUID,
                name: name,
                reason: reason
            });

            if (result.message !== "User added successfully")
                return interaction.reply({ content: "Error: " + result.message, ephemeral: true });
            else
                return interaction.reply({ content: "Successfully added user to EAC ban list", ephemeral: true });
        }
    }
}