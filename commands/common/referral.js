const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../../apiRequests.js');
const roles = require('../../roleTypes.json');

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
        .setName('referral')
        .setDescription('Use our referral system to earn points for our Ko-Fi!')
        .addSubcommand(subcommand => subcommand // Submit a referral code
            .setName('submit')
            .setDescription('Submit a referral code for a friend that referred you to our Ko-Fi!')
            .addStringOption(option => option
                .setName('code')
                .setDescription('The referral code you received from a friend')
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand // Check referral code and points for user
            .setName('check')
            .setDescription('Check your referral code and how many points you have accumulated'))
        .addSubcommand(subcommand => subcommand // Admin only - Assign a referral code to a user
            .setName('assign')
            .setDescription('Assign a referral code to a user (Admin only)')
            .addUserOption(option => option
                .setName('user')
                .setDescription('The user to assign the referral code to')
                .setRequired(true))
            .addStringOption(option => option
                .setName('code')
                .setDescription('The referral code to assign to the user')
                .setRequired(true))
            .addIntegerOption(option => option
                .setName('points')
                .setDescription('The amount of points to start the user with')))
        .addSubcommand(subcommand => subcommand // View the top referral codes
            .setName('leaderboard')
            .setDescription('View the top referral codes')
            .addStringOption(option => option
                .setName('sort')
                .setDescription('Sort the leaderboard by points or uses')
                .addChoices(
                    { name: 'Points', value: 'points' },
                    { name: 'Uses', value: 'uses' }
                )))
        .addSubcommand(subcommand => subcommand // View Redemption Values
            .setName('redeem')
            .setDescription('View the redemption values for referral codes')),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'submit') {
            const referralCode = interaction.options.getString('code');
            const discordId = interaction.user.id;

            console.log(`referralcode-submit: Input: ${discordId} | ${referralCode} `);

            let userInfo = await api.getUserByID(discordId);

            if (userInfo.error)
                return interaction.reply({ content: `You do not have an account linked. Please link your account instead of updating.`, ephemeral: true })
                    .then(() => console.log(`referralcode-submit: Error: ${userInfo.error}`))
                    .catch(`referralcode-submit: Error: ${userInfo.error} | Could not reply to user`);
            if (userInfo.referralCode)
                return interaction.reply({ content: `You have already submitted a referral code.`, ephemeral: true })
                    .then(() => console.log(`referralcode-submit: User already has a referral code`))
                    .catch(`referralcode-submit: Error: User already has a referral code | Could not reply to user`);
            if (userInfo.code)
                return interaction.reply({ content: `You have already submitted a referral code.`, ephemeral: true })
                    .then(() => console.log(`referralcode-submit: User already has a referral code`))
                    .catch(`referralcode-submit: Error: User already has a referral code | Could not reply to user`);

            // Check if the join date is greater than 7 days
            const dateJoined = new Date(userInfo.date_joined);
            const now = new Date();
            const dateDiff = Math.abs(now - dateJoined);
            const daysDiff = Math.floor(dateDiff / (1000 * 60 * 60 * 24));
            if (daysDiff > 7)
                return interaction.reply({ content: `You may only submit a referral code if you have been donating for less than 7 days.`, ephemeral: true });

            // Check if the referral code is valid and not expired
            const refCode = await api.getReferralByCode(referralCode);
            if (!refCode)
                return interaction.reply({ content: `The referral code you entered is invalid.`, ephemeral: true })
                    .then(() => console.log(`referralcode-submit: Invalid referral code`))
                    .catch(`referralcode-submit: Error: Invalid referral code | Could not reply to user`);
            if (refCode.error)
                return interaction.reply({ content: `Error: ${refCode.error}`, ephemeral: true })
                    .then(() => console.log(`referralcode-submit: Error: ${refCode.error}`))
                    .catch(`referralcode-submit: Error: ${refCode.error} | Could not reply to user`);
            if (!refCode.code)
                return interaction.reply({ content: `The referral code you entered is invalid.`, ephemeral: true })
                    .then(() => console.log(`referralcode-submit: Invalid referral code`))
                    .catch(`referralcode-submit: Error: Invalid referral code | Could not reply to user`);
            if (refCode.userId === discordId)
                return interaction.reply({ content: `You cannot use your own referral code.`, ephemeral: true })
                    .then(() => console.log(`referralcode-submit: User cannot use their own referral code`))
                    .catch(`referralcode-submit: Error: User cannot use their own referral code | Could not reply to user`);

            userInfo.code = referralCode;
            let refBonus = 0;

            switch (userInfo.type) {
                case 's_in':
                    refBonus = 1;
                    break;
                case 's_sp':
                    refBonus = 3;
                    break;
                case 's_ms':
                    refBonus = 5;
                    break;
                case 's_te':
                    refBonus = 10;
                    break;
                case 's_gd':
                    refBonus = 20;
                    break;
                default:
                    refBonus = 0;
                    break;
            }

            await api.updateUserByID(userInfo, discordId);
            let isUpdate = await api.updateReferralCode(refCode.code, refBonus);

            if (isUpdate.error)
                return interaction.reply({ content: `Error: ${isUpdate.error}`, ephemeral: true })
                    .then(() => console.log(`referralcode-submit: Error: ${isUpdate.error}`))
                    .catch(`referralcode-submit: Error: ${isUpdate.error} | Could not reply to user`);

            const dmUser = await interaction.guild.members.fetch(refCode.userId);
            if (dmUser) {
                let refDMEmbed = new EmbedBuilder()
                    .setTitle('Referral Bonus Received')
                    .setColor(interaction.member.displayColor)
                    .addFields(
                        { name: 'User:', value: `<@${discordId}>`, inline: true },
                        { name: 'Points Gained:', value: `${refBonus}`, inline: true },
                        { name: 'New Total:', value: `${refCode.points + refBonus}`, inline: true }
                    );
                dmUser.send({ embeds: [refDMEmbed] })
                    .then(() => console.log(`referralcode-submit: Sent DM to ${dmUser.id}`))
                    .catch(`referralcode-submit: Error: Could not send DM to ${dmUser.id}`);
            }

            return interaction.reply({ content: `Referral code: ${referralCode} submitted! You gave ${refBonus} point(s) to <@${refCode.userId}>.`, ephemeral: true })
                .then(() => console.log(`referralcode-submit: Referral code submitted`))
                .catch(`referralcode-submit: Error: Referral code submitted | Could not reply to user`);
        }
        else if (subcommand === 'check') {
            const discordId = interaction.user.id;

            const refCode = await api.getReferralByUserID(discordId);

            if (refCode.error)
                return interaction.reply({ content: `Error: ${refCode.error}`, ephemeral: true })
                    .then(() => console.log(`referralcode-check: Error: ${refCode.error}`))
                    .catch(`referralcode-check: Error: ${refCode.error} | Could not reply to user`);
                
            let userRefEmbed = new EmbedBuilder()
                .setTitle('Referral Code Information')
                .setColor(interaction.member.displayColor)
                .addFields(
                    { name: 'Your Code:', value: `${refCode[0].code}`, inline: true },
                    { name: 'Points:', value: `${refCode[0].points}` || '0', inline: true },
                    { name: 'Uses:', value: `${refCode[0].uses}` || '0', inline: true }
                );

            return interaction.reply({ embeds: [userRefEmbed], ephemeral: true })
                .then(() => console.log(`referralcode-check: Sent by ${interaction.member.id}`))
                .catch(`referralcode-check: Error: Could not reply to user`);
        }
        else if (subcommand === 'assign') {
            if (!interaction.member.permissions.has('ADMINISTRATOR'))
                return interaction.reply({ content: `You do not have permission to use this command.`, ephemeral: true })
                    .then(() => console.log(`referralcode-assign: User does not have permission`))
                    .catch(`referralcode-assign: Error: User does not have permission | Could not reply to user`);

            const user = interaction.options.getUser('user');
            const code = interaction.options.getString('code');
            const points = interaction.options.getInteger('points') || 0;

            const refCode = await api.getReferralByUserID(user.id) || await api.getReferralByCode(code);

            if (!refCode.error == 'No referral code data found')
                return interaction.reply({ content: `Error: ${refCode.error}`, ephemeral: true })
                    .then(() => console.log(`referralcode-assign: Error: ${refCode.error}`))
                    .catch(`referralcode-assign: Error: ${refCode.error} | Could not reply to user`);

            if (refCode.code)
                return interaction.reply({ content: `The user already has a referral code.`, ephemeral: true })
                    .then(() => console.log(`referralcode-assign: User already has a referral code`))
                    .catch(`referralcode-assign: Error: User already has a referral code | Could not reply to user`);

            const update = await api.createReferralCode({ code: code, userId: user.id, points: points });
            if (update.error)
                return interaction.reply({ content: `Error: ${update.error}`, ephemeral: true })
                    .then(() => console.log(`referralcode-assign: Error: ${update.error}`))
                    .catch(`referralcode-assign: Error: ${update.error} | Could not reply to user`);

            return interaction.reply({ content: `Referral code: ${code} assigned to <@${user.id}> with ${points} points.`, ephemeral: true })
                .then(() => console.log(`referralcode-assign: Referral code assigned`))
                .catch(`referralcode-assign: Error: Referral code assigned | Could not reply to user`);
        }
        else if (subcommand === 'leaderboard') {

            const topRef = await api.getTopReferralCodes(interaction.options.getString('sort') || 'points');

            if (topRef.error)
                return interaction.reply({ content: `Error: ${topRef.error}`, ephemeral: true })
                    .then(() => console.log(`referralcode-leaderboard: Error: ${topRef.error}`))
                    .catch(`referralcode-leaderboard: Error: ${topRef.error} | Could not reply to user`);

            let leaderboardEmbed = new EmbedBuilder()
                .setTitle('Top Referral Codes')
                .setColor('#FFD700');

            for (let i = 0; i < topRef.length; i++) {
                let place = `#${i + 1}`;
                switch (i) {
                    case 0:
                        place = '🥇';
                        break;
                    case 1:
                        place = '🥈';
                        break;
                    case 2:
                        place = '🥉';
                        break;
                    default:
                        place = place;
                        break;
                }
                leaderboardEmbed.addFields(
                    { name: `${place} - Code: ${topRef[i].code}`, value: `User: <@${topRef[i].userId}> | Points: ${topRef[i].points} | Uses: ${topRef[i].uses}` }
                );
            }

            return interaction.reply({ embeds: [leaderboardEmbed], ephemeral: true })
                .then(() => console.log(`referralcode-leaderboard: Complete for ${interaction.member.id}`))
                .catch(`referralcode-leaderboard: Error: Could not reply to user`);
        }
        else if (subcommand === 'redeem') {
            let currentPoints = await api.getReferralByUserID(interaction.user.id);
            console.log(currentPoints)
            if (currentPoints.error)
                return interaction.reply({ content: `Error: ${currentPoints.error}`, ephemeral: true })
                    .then(() => console.log(`referralcode-redeem: Error: ${currentPoints.error}`))
                    .catch(`referralcode-redeem: Error: ${currentPoints.error} | Could not reply to user`);

            currentPoints = currentPoints[0];
            if (!currentPoints.code)
                return interaction.reply({ content: `You do not have a referral code.`, ephemeral: true })
                    .then(() => console.log(`referralcode-redeem: User does not have a referral code`))
                    .catch(`referralcode-redeem: Error: User does not have a referral code | Could not reply to user`);

            let redeemEmbed = new EmbedBuilder()
                .setTitle('Referral Code Redemption Values')
                .setColor(interaction.member.displayColor)
                .addFields(
                    { name: 'Points:', value: `${currentPoints.points}` || '0', inline: true },
                    { name: 'Uses:', value: `${currentPoints.uses}` || '0', inline: true },
                    { name: '5 Points - $5 Rebate', value: '$1 per point', inline: true },
                    { name: '13 Points - $15 Rebate', value: '$1.15 per point', inline: true },
                    { name: '21 Points - $25 Rebate', value: '$1.19 per point', inline: true },
                    { name: '41 Points - $50 Rebate', value: '$1.22 per point', inline: true },
                    { name: '80 Points - $100 Rebate', value: '$1.25 per point', inline: true }
                )
                .setDescription('You can redeem your points for a rebate on your next donation. The more points you have, the more you save!' +
                '\n\nTo redeem your points, please contact a staff member.');

            return interaction.reply({ embeds: [redeemEmbed], ephemeral: true })
                .then(() => console.log(`referralcode-redeem: Complete for ${interaction.member.id}`))
                .catch(`referralcode-redeem: Error: Could not reply to user`);
        }
    }
}