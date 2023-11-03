const con = require('../mysqlConn.js');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		//create ratelimit for every guild in client
		client.guilds.cache.forEach(guild => {
			guild.ratelimit = 0;
		});
		// con.createCon();
		// client.guilds.resolve('GUILDID').members.fetch();
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};