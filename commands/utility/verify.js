import { SlashCommandBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { JSONFilePreset } from 'lowdb/node';

const config = await import('../../config.json', { assert: { type: 'json' } }).then(module => module.default);
const { baseUrl, roleId } = config;

const defaultData = { users: {} };
const db = await JSONFilePreset('db.json', defaultData);

await db.read();

async function execute(interaction) {
    function makeid(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    if (!interaction.guild) return;

    const userId = interaction.user.id;
    const username = interaction.options.getString('username');

    console.log("using url: " + baseUrl + 'api/get/user/username/' + username);

	if(db.data.users[userId] && db.data.users[userId].verified) {
		await interaction.reply({
			content: `You have already verified your account.`,
			ephemeral: true
		});

		return;
	}

    async function fetchUserData(baseUrl, username) {
        try {
            const response = await fetch(baseUrl + 'api/get/user/username/' + username);
            if (!response.ok) {
                await interaction.reply({ content: "The user you provided does not exist or there was an error fetching the user data.", ephemeral: true });
                return null;
            }
            const data = await response.json();
            return data;
        } catch (e) {
            console.error(e);
            await interaction.reply({ content: "There was an error fetching the user data.", ephemeral: true });
            return null;
        }
    }
    
	const userData = await fetchUserData(baseUrl, username);
	if (!userData) return;
	
	let randomToken = makeid(10);
	
	db.data.users = db.data.users || {};
	
	if (db.data.users[userId]) {
		console.log(`User ID ${userId} is already in the database.`);
		console.log(`userdata: ${userData}`);
		console.log(`description: ${db.data.users[userId].description}`);
		if(db.data.users[userId].description == userData.description) {
			db.data.users[userId].verified = true;
			await db.write();
		
			const member = await interaction.guild.members.fetch(userId);
		
			await member.roles.add(roleId).then(() => {
				interaction.reply({
					content: `You have successfully verified your account. Please wait for your roles to be updated.`,
					ephemeral: true
				});
			}).catch(error => {
				console.error(`Could not add role to user: ${error}`);
				interaction.reply({
					content: `There was an error updating your roles. Please contact an administrator.`,
					ephemeral: true
				});
			});
		} else {
			delete db.data.users[userId];
			await db.write();

			await interaction.reply({
				content: `You have not verified your account. Please run the command again for a new verification key.`,
				ephemeral: true
			});
		}
	} else {
		db.data.users[userId] = {
			username: username,
			description: randomToken,
			verified: false
		};
	
		await db.write();
	
		await interaction.reply({
			content: `Please set your BLOXBLOX account's description to ||\`${randomToken}\`||, and run this command again.`,
			ephemeral: true
		});
	}	
}

const data = new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Use this command to verify your account.')
    .addStringOption(option =>
        option.setName('username')
            .setDescription('BLOXBLOX Username')
            .setRequired(true));

export default { data, execute };