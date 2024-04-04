const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, VoiceConnectionStatus } = require('@discordjs/voice');
const { Spotify } = require('spotify');

const spotifyClient = new Spotify({
    clientId: process.env.spotify_clientId,
    clientSecret: process.env.spotify_client_secret,
});

const songQueue = [];

let startTime;

let botConnected = false;

let connection;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song in your voice channel')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Song name or link from a supported streaming service')
                .setRequired(true)
        ),
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply('You need to be in a voice channel to use this command!');
        }

        const player = createAudioPlayer();

        const query = interaction.options.getString('query');

        try {
            let audioUrl;

            if (query.includes('spotify')) {
                audioUrl = await getSpotifyAudioUrl(query);
            } else {
                return interaction.reply('The provided link is not supported or invalid.');
            }

            const resource = createAudioResource(audioUrl, { inputType: StreamType.Arbitrary });
            player.play(resource);

            connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            connection.subscribe(player);
            await interaction.reply(`Now playing: ${query}`);


            startTime = Date.now();


            songQueue.push(query);


            botConnected = true;
        } catch (error) {
            console.error('Error playing the song:', error);
            await interaction.reply('An error occurred while trying to play the song. Please make sure the input is valid.');
        }
    },
};

async function getSpotifyAudioUrl(query) {
    try {
        const trackId = parseQuery(query);
        const audioUrl = await spotifyClient.getAudioUrl(trackId);
        return audioUrl;
    } catch (error) {
        console.error('Error fetching audio URL from Spotify:', error);
        throw new Error('Error fetching audio URL from Spotify');
    }
}

function parseQuery(query) {

}

