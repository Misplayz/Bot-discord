const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Bot leaves the voice channel!'),
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;

        if (voiceChannel) {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            if (connection) {
                try {
                    connection.destroy();
                    await interaction.reply(`Bot has left from ${voiceChannel.name}!`);
                } catch (error) {
                    console.error('Error while destroying connection:', error);
                    await interaction.reply(`Failed to leave form ${voiceChannel.name}. An error occurred.`);
                }
            } else {
                await interaction.reply(`An error occured when connect to ${voiceChannel.name}.`);
            }
        } else {
            await interaction.reply('You have to join a voice channel first!');
        }
    },
};