import { Events } from 'discord.js';

const name = Events.ClientReady;
const once = true;

function execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
}

export default { name, once, execute };
