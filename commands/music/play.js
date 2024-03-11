const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a YouTube video in your voice channel')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('YouTube video link or search query')
                .setRequired(true)
        ),
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply('You need to be in a voice channel to use this command!');
        }

        const player = createAudioPlayer();

        const query = interaction.options.getString('query');

        const urlRegex = /^(http(s)?:\/\/)?((www\.youtube\.com|m\.youtube\.com)\/.+|youtu\.be\/.+)/;

        // Check if the query is a valid YouTube URL
        if (!urlRegex.test(query)) {
            return interaction.reply('Please provide a valid YouTube video URL.');
        }

        try {
            const stream = await ytdl(query, { filter: 'audioonly' });
            if (!stream) {
                throw new Error('Unable to fetch the audio stream from the provided URL.');
            }

            const resource = createAudioResource(stream, { inputType: StreamType.Opus });
            player.play(resource);

            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            connection.subscribe(player);
            await interaction.reply(`Now playing: ${query}`);
        } catch (error) {
            console.error('Error playing YouTube video:', error);
            await interaction.reply('An error occurred while trying to play the YouTube video. Please make sure the input is valid.');
        }
    },
};
