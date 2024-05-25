const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, ModalBuilder, TextInputStyle, TextInputBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { token } = require('./config.json');
const getAccessToken = require('./spotify/spotify_access');
const deployCommands = require('./deploy-commands');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Event handler for interactionCreate event
client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return;

    // Check if the submitted modal is the introduction modal
    if (interaction.customId === 'introduceModal') {
        const nickname = interaction.fields.getTextInputValue('nicknameInput');
        const age = interaction.fields.getTextInputValue('ageInput');
        const gender = interaction.fields.getTextInputValue('genderInput');

        // Build the embed
        const taggedUser = interaction.user.toString();
        const messageContent = `${taggedUser}`;
        const indEmbed = new EmbedBuilder()
            .setTitle('Introduction has been confirmed.✅')
            .setColor('#00FFFF')
            .addFields(
                { name: 'Nickname', value: nickname },
                { name: 'Age', value: age },
                { name: 'Gender', value: gender }
            )
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()

        const targetChannel = interaction.guild.channels.cache.get('1243918701749866630');
        if (targetChannel) {
            await targetChannel.send({ content: messageContent, embeds: [indEmbed] });

            // Add new role and remove old role
            const member = await interaction.guild.members.fetch(interaction.user);
            const newRole = interaction.guild.roles.cache.get('1243914187747627008');
            const oldRole = interaction.guild.roles.cache.get('1243913819580010536');

            if (newRole) await member.roles.add(newRole);
            if (oldRole) await member.roles.remove(oldRole);

            // Respond with a success message
            await interaction.reply({ content: 'Your introduction has been successfully submitted!', ephemeral: true });
        } else {
            console.log('Target channel not found.');
        }
    }
});

(async () => {
    try {
        const accessToken = await getAccessToken();
        console.log('Spotify Access Token:', accessToken);

        await deployCommands();

        await client.login(token);
    } catch (error) {
        console.error('Error:', error);
    }
})();
