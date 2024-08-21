/**
 * @fileoverview This module defines a Discord slash command that allows users to view their profile or someone else's profile.
 * It displays basic user information and allows the user to toggle their admiration opt-in status if it is their own profile.
 * 
 * Dependencies:
 * - Requires `discord.js` for building and executing Discord commands.
 * - Requires custom functions `getUserByID` and `createUserByID` from the API Functions for user data.
 * - Requires the `config.json` file for the developer IDs.
 * 
 * Constants:
 * - None in this file directly; relies on settings from the user data.
 * 
 * @module profileCommand
 * @version 2.0.0
 * @since 2024-08-18
 * 
 * @author 0xDrMoe
 */

const { EmbedBuilder, SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getUserByID, createUserByID } = require('../../API Functions/profiles');
const { devIDs } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your profile or someone else\'s')
        .addUserOption(option => option.setName('user').setDescription('User to view')),

    async execute(interaction) {
        const member = interaction.options.getMember('user') || interaction.member;
        const memberData = await getUserByID(member.id);

        if (memberData.error) {
            console.error(`profile: failed to get user data for ${member.tag}`);
            return interaction.reply({ content: `Failed to get user data for ${member.tag}. This shouldn't happen, please contact Moe.`, ephemeral: true });
        }

        if (memberData.result === 'No user found with that ID') {
            await createUserByID({ userID: member.id }, member.id);
        }

        let profileEmbed = new EmbedBuilder()
            .setColor(member.displayHexColor)
            .setAuthor({ name: `${member.user.tag}'s Profile`, iconURL: member.displayAvatarURL({ dynamic: true }) })
            .setThumbnail(member.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setDescription(`${member}`)
            .setFooter({ text: `User ID: ${member.id} • Join discord.gg/tohe for any questions`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .addFields([
                { name: 'Known As:', value: `${await getTitle(member)}`, inline: true },
                { name: 'Account Created:', value: `<t:${Math.floor(member.user.createdAt.getTime() / 1000)}:R>`, inline: true },
                { name: 'Joined Server:', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: 'Roles:', value: await getRoles(member) },

            ]);

        if (member.id === interaction.member.id) {
            profileEmbed.addFields([
                { name: 'Admire Opt-In:', value: memberData.admireOptIn ? 'Yes' : 'No', inline: true },
            ]);

            const admireButton = new ButtonBuilder()
                .setLabel('Toggle Admire Opt-In')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('toggle_admire_opt_in');

            const row = new ActionRowBuilder().addComponents(admireButton);
            return interaction.reply({ embeds: [profileEmbed], components: [row], ephemeral: true }).then(async (r) => {
                const collectorFilter = i => member.id === interaction.member.id;
                try {
                    await r.awaitMessageComponent({ filter: collectorFilter, max: 4, time: 300000 });
                } catch (e) {
                    row.components[0].setDisabled(true);
                    await interaction.editReply({ content: `This message has expired, please try again`, components: [row] });
                }
            }).catch(console.error);
        }

        interaction.reply({ embeds: [profileEmbed], ephemeral: true });
    }
};

async function getTitle(member) {
    const memberPermissions = member.permissions.toArray();
    if (devIDs.includes(member.id)) return '🤖 Bot Developer';
    if (member.id === member.guild.ownerId) return 'Server Owner';
    if (memberPermissions.includes('Administrator')) return 'Server Administrator';
    if (memberPermissions.includes('ManageGuild')) return 'Server Manager';
    if (memberPermissions.includes('ManageMessages') || memberPermissions.includes('ManageRoles')) return 'Server Moderator';
    return 'Server Member';
}

async function getRoles(member) {
    const memberRoles = member.roles.cache.sort((a, b) => b.position - a.position).map(r => r.name);
    console.log(memberRoles);
    const joinedRoles = memberRoles.join(', ');

    if (joinedRoles.length >= 1024) {
        return 'Too Many Roles';
    }

    return joinedRoles || 'No Roles';
}