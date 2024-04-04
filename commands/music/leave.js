const { SlashCommandBuilder } = require('discord.js');
const { VoiceConnectionStatus } = require('@discordjs/voice');

let botConnected = false;
let songQueue = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Bot leaves the voice channel!'),
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;

        if (voiceChannel) {
            const connection = voiceChannel.guild.voiceStates.cache.get(interaction.client.user.id);

            if (connection) {
                try {
                    await connection.destroy();
                    await interaction.reply(`Bot has left from ${voiceChannel.name}!`);
                    botConnected = false;
                    songQueue = [];
                } catch (error) {
                    console.error('Error while destroying connection:', error);
                    await interaction.reply(`Failed to leave from ${voiceChannel.name}. An error occurred.`);
                }
            } else {
                await interaction.reply(`An error occurred when connecting to ${voiceChannel.name}.`);
            }
        } else {
            await interaction.reply('You have to join a voice channel first!');
        }
    },
};

setInterval(() => {
    if (!songQueue.length && botConnected) {
        setTimeout(async () => {
            if (!songQueue.length && botConnected) {
                // บอทออกหากไม่มีเพลงในคิวและไม่ได้รับคำสั่งเพิ่มเพลงเข้าคิวภายใน 3 นาที
                botConnected = false;
                songQueue = [];
                console.log('Bot left the voice channel.');
                
                // ส่งข้อความกลับออกไปเมื่อบอทออกจาก voice channel
                const guildId = interaction.guild.id;
                const channel = interaction.client.channels.cache.get(guildId);
                await channel.send(`I left ${voiceChannel.name} because there were no more tracks to play for 3 minutes`);
            }
        }, 3 * 60 * 1000);
    }
}, 1000);
