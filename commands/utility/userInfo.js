import { SlashCommandBuilder } from 'discord.js';
const config = await import('./../../config.json', { assert: { type: 'json' } }).then(module => module.default);
const { clientId, guildId, token } = config;
import fetch from 'node-fetch';

const { baseUrl } = config;

const data = new SlashCommandBuilder()
    .setName('user-information')
    .setDescription('Use this command to get information about a user.')
    .addStringOption(option =>
        option.setName('username')
            .setDescription('BLOXBLOX Username')
            .setRequired(true));

async function execute(interaction) {
    const target = interaction.options.getString('username');
    console.log(`${baseUrl}api/get/user/username/${target}`);

    async function fetchUserData(baseUrl, target) {
        try {
            const response = await fetch(`${baseUrl}api/get/user/username/${target}`);
            if (!response.ok) {
                await interaction.reply({ content: "The user you provided does not exist or there was an error fetching the user data.", ephemeral: false });
                return null;
            }
            const data = await response.json();
            console.log(data);
            return data;
        } catch (e) {
            console.error(e);
            await interaction.reply({ content: "There was an error fetching the user data.", ephemeral: false });
            return null;
        }
    }
    
    const userData = await fetchUserData(baseUrl, target);
    if (!userData) {
        return;
    }

    await interaction.reply({ content: `Data for ${target} fetched successfully: \n\`\`\`json\n${JSON.stringify(userData, null, 4)}\`\`\``, ephemeral: false });
}

export default { data, execute };
