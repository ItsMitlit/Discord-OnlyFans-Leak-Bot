const fs = require('fs');
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
require('dotenv').config();


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions
    ]
});

client.once('ready', () => {
    console.log('Ready!');
});

client.commands = new Map();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
  
    if (!command) return;
  
    try {
        await interaction.deferReply({ ephemeral: true });
        await command.execute(interaction);
    
    } catch (error) {
        console.error(error);
        await interaction.editReply({ content: 'There was an error while executing this command!' });
    }
});

client.login(process.env.DISCORD_TOKEN);

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: [
                {
                    name: 'getleaks',
                    description: 'Fetch a random image from a specific creator.',
                    options: [
                        {
                            name: 'platform',
                            type: 3,
                            description: `The creator's platform.`,
                            required: true,
                            choices: [
                                { name: 'Onlyfans', value: 'onlyfans' },
                                { name: 'Fansly', value: 'fansly' },
                            ]
                        },
                        {
                            name: 'creator',
                            type: 3,
                            description: 'The creator you want to fetch a leak for.',
                            required: true
                        }
                    ]
                }
            ]},
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();