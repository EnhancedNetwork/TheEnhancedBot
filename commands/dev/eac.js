const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { pagination, ButtonTypes, ButtonStyles } = require('@devraelfreeze/discordjs-pagination');
const config = require('../../config.json');
const { ban, unban, getAllEACUsers, getUserByFriendCode, getUserByHashPUID } = require('../../API Functions/eac.js');
const { type } = require('./adminupdate.js');

function checkCode(code) {
    const hashPosition = code.length - 5;
    return code[hashPosition] === '#' && /^[0-9]{4}$/.test(code.slice(-4));
}

// Helper to find a user by friend code or hashPUID
async function findUser(friendCode, hashPUID) {
    if (friendCode) {
        friendCode = friendCode.replace('#', '%23');
        const result = await getUserByFriendCode(friendCode);
        if (result.name) return result;
    }
    if (hashPUID) {
        const result = await getUserByHashPUID(hashPUID);
        if (result.name) return result;
    }
    return null;
}

// Handle 'list' subcommand
async function handleList(interaction) {
    const result = await getAllEACUsers();
    if (!result || result.error) {
        return interaction.reply({ content: `Error: ${result.error || 'Unknown error'}`, ephemeral: true });
    }

    const playerEmbeds = [];
    let embed = new EmbedBuilder()
        .setTitle("List of banned users")
        .setColor("FF0000")
        .setDescription(`\\# - Name - Friend Code - Hash PUID`)
        .setFooter({ text: `EAC Ban List - Page 1` });

    result.forEach((player, i) => {
        embed.addFields({
            name: player.name,
            value: `${player.friendcode === "null" ? "N/A" : player.friendcode} - ${player.hashPUID === "null" ? "N/A" : player.hashPUID}\n${player.reason}`,
            inline: true
        });

        if ((i + 1) % 8 === 0) {
            playerEmbeds.push(embed);
            embed = new EmbedBuilder()
                .setTitle("List of banned users")
                .setColor("FF0000")
                .setDescription(`\\# - Name - Friend Code - Hash PUID`)
                .setFooter({ text: `EAC Ban List - Page ${playerEmbeds.length + 1}` });
        }
    });

    playerEmbeds.push(embed);
    await pagination({
        interaction: interaction,
        embeds: playerEmbeds,
        author: interaction.member.user,
        ephemeral: true,
        time: 60000,
        fastSkip: true,
        disableButtons: true,
        pageTravel: false,
        customFilter: (i) => i.member.user.id === interaction.member.user.id,
        buttons: [
            {
                type: ButtonTypes.previous,
                label: 'Previous',
                style: ButtonStyles.Success,
                emoji: '◀️'
            },
            {
                type: ButtonTypes.next,
                label: 'Next',
                style: ButtonStyles.Success,
                emoji: '▶️'
            }
        ]
    });
}

// Handle 'search' subcommand
async function handleSearch(interaction, friendCode, hashPUID) {
    if (!friendCode && !hashPUID) {
        return interaction.reply({ content: "You must provide at least one of the following: friend code, hash PUID", ephemeral: true });
    }

    if (friendCode && !checkCode(friendCode)) {
        return interaction.reply({ content: "Invalid friend code", ephemeral: true });
    }

    const result = await findUser(friendCode, hashPUID);
    if (!result) {
        return interaction.reply({ content: "No user found with that friend code or hash PUID", ephemeral: true });
    }

    const embed = new EmbedBuilder()
        .setTitle(`Info for ${result.name}`)
        .addFields(
            { name: "Friend Code", value: result.friendcode ?? "Not Available", inline: true },
            { name: "Hash PUID", value: result.hashPUID ?? "Not Available", inline: true },
            { name: "Reason", value: result.reason, inline: true },
        )
        .setColor("FF0000")
        .setFooter({ text: "EAC Ban List" })
        .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
}

// Handle 'remove' subcommand
async function handleRemove(interaction, friendCode, hashPUID) {
    if (!friendCode && !hashPUID) {
        return interaction.reply({ content: "You must provide at least one of the following: friend code, hash PUID", ephemeral: true });
    }

    if (friendCode && !checkCode(friendCode)) {
        return interaction.reply({ content: "Invalid friend code", ephemeral: true });
    }

    const result = await findUser(friendCode, hashPUID);
    if (!result) {
        return interaction.reply({ content: "No user found with that friend code or hash PUID", ephemeral: true });
    }

    const unbanResult = await unban({
        friendcode: friendCode ? friendCode.replace('#', '%23') : null,
        hashPUID: result.hashPUID ? result.hashPUID : null
    });

    console.log(unbanResult);

    if (unbanResult.message !== "User removed successfully") {
        return interaction.reply({ content: `Error: ${unbanResult.message}`, ephemeral: true });
    }
    
    return interaction.reply({ content: "Successfully removed user from EAC ban list", ephemeral: true });
}

// Handle 'add' subcommand
async function handleAdd(interaction, friendCode, hashPUID, name, reason) {
    if (!friendCode && !hashPUID) {
        return interaction.reply({ content: "You must provide at least one of the following: friend code, hash PUID", ephemeral: true });
    }

    if (friendCode && !checkCode(friendCode)) {
        return interaction.reply({ content: "Invalid friend code", ephemeral: true });
    }

    const result = await ban({
        friendcode: friendCode,
        hashPUID: hashPUID,
        name: name,
        reason: reason
    });

    if (result.message !== "User added successfully") {
        return interaction.reply({ content: `Error: ${result.message}`, ephemeral: true });
    }
    
    return interaction.reply({ content: "Successfully added user to EAC ban list", ephemeral: true });
}

module.exports = {
    type: 'dev',
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
        const discordId = interaction.user.id;
        if (!config.devIDs.includes(discordId)) {
            return interaction.reply({ content: "You are not allowed to use this command", ephemeral: true });
        }

        const friendCode = interaction.options.getString('friendcode');
        const hashPUID = interaction.options.getString('hashpuid');
        const name = interaction.options.getString('name');
        const reason = interaction.options.getString('reason');

        switch (interaction.options.getSubcommand()) {
            case 'list':
                return handleList(interaction);
            case 'search':
                return handleSearch(interaction, friendCode, hashPUID);
            case 'remove':
                return handleRemove(interaction, friendCode, hashPUID);
            case 'add':
                return handleAdd(interaction, friendCode, hashPUID, name, reason);
            default:
                return interaction.reply({ content: "Invalid subcommand", ephemeral: true });
        }
    }
};
