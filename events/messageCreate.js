const { Events, PermissionsBitField } = require('discord.js');
const linkRegex = /(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/[^\s]*)?/i;

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot) return;
        // if (linkRegex.test(message.content) && !message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        //     message.delete()
        //         .then(msg => {
        //             console.log(`Deleted link from ${msg.author.id}`);
        //         })
        //         .catch(console.error);
        //     message.guild.channels.resolve('1122232494402580490').send(`Link deleted in ${message.channel} sent by ${message.author}`)
        //         .then(() => {
        //             console.log(`Logged link deleted "${message.content}"`);
        //         })
        //         .catch(console.error);
        // }
    }
}