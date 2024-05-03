const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const deployCommands = require('./deploy-commands'); // Changed variable name to deployCommands

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');

// Function to load commands
const loadCommands = (dir) => {
    const commandFiles = fs.readdirSync(dir).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(dir, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
};

// Load commands from all command folders
fs.readdirSync(commandsPath).forEach(folder => {
    loadCommands(path.join(commandsPath, folder));
});

// Load events
const eventsPath = path.join(__dirname, 'events');
fs.readdirSync(eventsPath).forEach(file => {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
});

// Deploy commands and login
(async () => {
    try {
        await deployCommands(); // Call deployCommands without parentheses ()

        await client.login(process.env.token);
    } catch (error) {
        console.error('Error:', error);
    }
})();
