const { MessageEmbed, MessageAttachment } = require('discord.js');
let { joinRole } = require('../config.json');
const wait = require('util').promisify(setTimeout);


module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return;
        if (message.channel.id == '942822742737190993') {
            if (message.content.includes('discord.gg') || message.content.includes('twitter.com') ) {
                message.delete()
                    .then(msg => {
                        console.log(`Deleted link from ${msg.author.id}`);
                    })
                    .catch(console.error);
                message.reply("Do not post links in this server. It's a bannable offence.")
                    .then(msg => {
                        setTimeout(() => { msg.delete().catch(() => console.log("Couldn't delete reply")); }, 5000)

                    })
                    .catch(console.error);
                message.guild.channels.resolve('928905590363803698').send(`Link deleted in ${message.channel} sent by ${message.author}`)
                    .then(() => {
                        console.log(`Replied to message "${message.content}"`);
                    })
                    .catch(console.error);
            }
        }
    }
}