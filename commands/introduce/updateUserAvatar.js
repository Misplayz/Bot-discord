const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update_introduce_avatar')
        .setDescription('Update the avatar in introduction message.'),

    async execute(interaction) {
        // Check if the interaction has already been acknowledged or replied
        if (interaction.deferred || interaction.replied) {
            console.log('Interaction already acknowledged or replied.');
            return;
        }

        // Check if the bot is in the correct channel
        if (interaction.channelId !== '1232908741414752256') {
            await interaction.reply({ content: 'You cannot use this command in this channel.', ephemeral: true });
            return;
        }

        const targetChannel = interaction.guild.channels.cache.get('1152979594337599579');
        if (!targetChannel) {
            console.log('Target channel not found.');
            await interaction.reply({ content: 'Error: Target channel not found.', ephemeral: true });
            return;
        }

        // Fetch all messages in the channel
        const messages = await targetChannel.messages.fetch();
        
        // Update embed with new avatar URL
        const updateAvatar = async (message) => {
            const embeds = message.embeds;
            if (!embeds.length) return;

            const oldEmbed = embeds[0];

            // Check if the embed has the same title as the introduce message
            if (oldEmbed.title === `Introduce by ${interaction.user.tag} has been confirmed.`) {
                const newEmbed = new EmbedBuilder(oldEmbed)
                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 256 }));

                // Update the message with the new embed
                await message.edit({ embeds: [newEmbed] });
            }
        };

        // Loop through each message and update embed if needed
        messages.forEach(updateAvatar);

        // Send acknowledgment
        await interaction.deferReply();

        // Send confirmation message
        await interaction.editReply({ content: 'Avatar in introduction messages has been updated.', ephemeral: true });
    },
};
