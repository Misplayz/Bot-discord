const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Let bot join voice channel'),

    async execute(interaction) {
        // ตรวจสอบว่า interaction และ member มีค่าหรือไม่
        if (!interaction || !interaction.member) {
            console.error('Invalid interaction or member.');
            return;
        }

        // ตรวจสอบว่า member เข้าร่วม Voice Channel หรือไม่
        const memberVoiceChannel = interaction.member.voice?.channel;
        if (!memberVoiceChannel) {
            await interaction.reply('You have to join a voice channel first!');
            return;
        }

        const guild = interaction.guild;
        const botVoiceChannel = getVoiceConnection(guild.id)?.joinConfig?.channelId;

        if (botVoiceChannel && botVoiceChannel !== memberVoiceChannel.id) {
            await interaction.reply('Bot is already in another voice channel.');
            return;
        }

        try {
            // เข้าร่วม Voice Channel
            const connection = joinVoiceChannel({
                channelId: memberVoiceChannel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
            });

            await interaction.reply(`Bot has joined ${memberVoiceChannel.name}.`);

            // Optional: You can listen for events on the connection
            connection.on('stateChange', (oldState, newState) => {
                console.log(`Connection state changed: ${oldState.status} => ${newState.status}`);
            });

            // Optional: Disconnect when the bot leaves the voice channel
            // connection.disconnect();
        } catch (error) {
            console.error(error);
            await interaction.reply('There was an error trying to join the voice channel.');
        }
    },
};
