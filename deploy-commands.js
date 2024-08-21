const { REST, Routes } = require('discord.js');
const { clientId, devServerID, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const regCommands = [];
const toheCommands = [];
// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	console.log(`Loading commands from ${folder}...`);
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			if (command.notReady) continue;
			if (folder === 'dev' || folder === 'owner' || folder === 'tohe')
				toheCommands.push(command.data.toJSON());
			else
				regCommands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${regCommands.length + toheCommands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: regCommands }
		);

		const toheData = await rest.put(
			Routes.applicationGuildCommands(clientId, devServerID),
			{ body: toheCommands }
		);

		console.log(`Successfully reloaded ${data.length} global commands.`);
		console.log(`Successfully reloaded ${toheData.length} TOHE commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();