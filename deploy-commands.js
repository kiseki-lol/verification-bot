import { REST, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';

const commands = [];
const foldersPath = path.join(process.cwd(), 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = `file://${path.join(commandsPath, file)}`;
        import(filePath).then(command => {
            if ('data' in command.default && 'execute' in command.default) {
                commands.push(command.default.data.toJSON());
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        });
    }
}

const config = await import('./config.json', { assert: { type: 'json' } }).then(module => module.default);
const { clientId, guildId, token } = config;

const rest = new REST().setToken(token);

(async () => {
    await Promise.all(commandFolders.map(async folder => {
    }));

    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
        console.log('Successfully deleted all guild commands.');

        await rest.put(Routes.applicationCommands(clientId), { body: [] });
        console.log('Successfully deleted all application commands.');

        const data = await rest.put(Routes.applicationCommands(clientId), { body: commands });
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();
