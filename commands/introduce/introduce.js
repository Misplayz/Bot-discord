const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('introduce')
        .setDescription('Allows a user to introduce themselves.'),

    async execute(interaction) {
        try {
            // Check if the bot is in the correct channel
            if (interaction.channelId !== '1243909129786097744') {
                await interaction.reply({ content: `This command cannot use in this channel.`, ephemeral: true });
                return;
            }
        
        // Check if interaction has already been replied to or deferred
        if (interaction.replied || interaction.deferred) return;

            // Create the modal
            const modal = new ModalBuilder()
                .setCustomId('introduceModal')
                .setTitle('Introduce Yourself');

            // Create the text input components
            const nicknameInput = new TextInputBuilder()
                .setCustomId('nicknameInput')
                .setLabel("What's your nickname?")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const ageInput = new TextInputBuilder()
                .setCustomId('ageInput')
                .setLabel("What's your age?")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const genderInput = new TextInputBuilder()
                .setCustomId('genderInput')
                .setLabel("What's your gender?")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            // Add inputs to action rows
            const firstActionRow = new ActionRowBuilder().addComponents(nicknameInput);
            const secondActionRow = new ActionRowBuilder().addComponents(ageInput);
            const thirdActionRow = new ActionRowBuilder().addComponents(genderInput);

            // Add action rows to modal
            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

            // Show the modal to the user
            await interaction.showModal(modal);
        } catch (error) {
            console.error('Error executing introduce command:', error);
        }
    },
};
