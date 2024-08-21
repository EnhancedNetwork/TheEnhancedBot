const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createUserByID, getUserByID } = require('../../API Functions/userinfo.js');
const types = require('../../roleTypes.json');

function checkRole(member) {
    for (const [categoryKey, category] of Object.entries(types))
        for (const [roleKey, role] of Object.entries(category))
            if (member.roles.cache.has(role.roleID))
                return { roleKey, role };
    return null;
}

function isValidCode(code) {
    return code.slice(-5, -4) === '#' && /^[0-9]+$/.test(code.slice(-4));
}

function determineAccess(role, isSponsor) {
    const accessRoles = {
        s_jc: { up: 1, dev: 0, color: 0, debug: 1 },
        s_cr: { up: 1, dev: 1, color: 1, debug: 1 },
        s_bo: { up: 0, dev: 0, color: 0, debug: 0, tag: 'Booster', colorCode: 'ffc0cb' },
        sponsor: { tag: 'Sponsor', colorCode: 'ff0000' },
        // Add other specific roles as needed
    };

    // Return the matched access role or a default empty object
    return accessRoles[role?.roleKey] || (isSponsor ? accessRoles.sponsor : {});
}

async function handleUserLinking(interaction, codeInput, discordId, discordName, roleData, isSponsor) {
    const userInfo = await getUserByID(discordId);

    if (userInfo?.userID && userInfo.friendcode !== "null") {
        console.log(`linkcmd: Command Cancelled - ${discordName} already has an account linked`);
        return interaction.reply({ content: "You already have this account linked. Please unlink it first.", ephemeral: true });
    }

    if (!isValidCode(codeInput)) {
        console.log(`linkcmd: Command Cancelled - ${discordName} entered an invalid friend code`);
        return interaction.reply({ content: "Invalid Friend Code. Format must include the `#1234` at the end. Example: `friendcode#1234`", ephemeral: true });
    }

    const { up = 0, dev = 0, color = 0, debug = 0, tag: overhead_tag = null, colorCode: userColor = null } =
        determineAccess(roleData, isSponsor);

    const createdDate = new Date(interaction.createdAt).toISOString().split('T')[0];

    const createUser = await createUserByID({
        userID: discordId,
        type: roleData?.roleKey, // Ensure the correct roleKey is sent
        friendcode: codeInput,
        name: discordName,
        overhead_tag,
        color: userColor,
        isUP: up,
        isDev: dev,
        colorCmd: color,
        debug,
        date_joined: createdDate
    });

    if (createUser.result === "Error creating user") {
        return interaction.reply({
            content: "An error occurred while linking your account. Please try again later. If this issue persists, please contact a developer.",
            ephemeral: true
        });
    }

    console.log(`linkcmd: Command Completed - ${discordName} linked their account successfully`);
    return interaction.reply({ content: "Successfully linked your account!", ephemeral: true });
}

module.exports = {
    type: 'tohe',
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link your Discord to your Among Us Friend Code')
        .addStringOption(option =>
            option.setName('friendcode')
                .setDescription('Your Among Us Friend Code')
                .setRequired(true)
        ),

    async execute(interaction) {
        const codeInput = interaction.options.getString('friendcode');
        const discordId = interaction.user.id;
        const discordName = interaction.user.username;
        const isSponsor = interaction.member.roles.cache.has('1161429535020040282');

        console.log(`linkcmd: Received by ${discordId}`);

        const roleData = checkRole(interaction.member);
        if (!roleData) {
            const noRoleEmbed = new EmbedBuilder()
                .setTitle("Unable to Link Account")
                .setDescription("You are not eligible to link your account. If you believe this is in error, please contact a developer.")
                .addFields([
                    {
                        name: "Want to become a sponsor and get access to Dev builds?",
                        value: "Visit [our Subscription page](https://weareten.ca/tohe) to become a sponsor for as little as __**$5 a month**__!"
                    },
                    {
                        name: "Dev Builds - $5/month:",
                        value: "Unstable but lots of features. Updated 2-3 times a **week**. [Donate Here](https://weareten.ca/tohe)",
                        inline: true
                    }
                ]);
            console.log(`linkcmd: Command Cancelled - ${discordName} does not have a sponsor role`);
            return interaction.reply({ embeds: [noRoleEmbed], ephemeral: true });
        }

        await handleUserLinking(interaction, codeInput, discordId, discordName, roleData, isSponsor);
    }
};
