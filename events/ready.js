const con = require('../mysqlConn.js');
const { CronJob } = require('cron');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		//create ratelimit for every guild in client
		client.guilds.cache.forEach(guild => {
			guild.ratelimit = 0;
		});
		let count = 0
		// const job = new CronJob(
		// 	'0 0 */1 * * *', // cronTime
		// 	function () {
		// 		console.log("Cronjob running: " + new Date(this.nextDate()));
		// 	}, // onTick
		// 	null, // onComplete
		// 	true, // start
		// 	'America/Los_Angeles', // timeZone
		// 	null, // context
		// 	true // runOnInit
		// );
		// console.log("Cronjob started: " + new Date(job.nextDate()));
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};