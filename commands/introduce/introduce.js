const { Client, EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('introduce')
        .setDescription('Allows a user to introduce themselves.')
        .addStringOption(option => 
            option.setName('nickname')
            .setDescription('Enter your nickname')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('age')
            .setDescription('Enter your age')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('gender')
            .setDescription('Enter your gender')
            .setRequired(true)),

    async execute(interaction) {
        const userNickname = interaction.options.getString('nickname');
        const userAge = interaction.options.getString('age');
        const userGender = interaction.options.getString('gender');
        
        // Tag the user in text format
        const taggedUser = interaction.user.toString();
        
        const messageContent = `Please confirm your introduction by clicking one of the buttons below.`;
        
        const confirm = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Success);
            
        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary);
            
        const row = new ActionRowBuilder()
            .addComponents(cancel, confirm);
            
        // Create Embed
        const embed = new EmbedBuilder()
            .setTitle(`Please confirm your introduction`)
            .setColor('#00FFFF')
            .addFields(
                { name: 'Nickname', value: userNickname},
                { name: 'Age', value: userAge},
                { name: 'Gender', value: userGender}
            )
            .setThumbnail(interaction.user.avatarURL({ dynamic: true })) // Update here
            .setTimestamp();
            
        // Send message and Embed together
        const initialMessage = await interaction.reply({ content: messageContent, embeds: [embed], components: [row], ephemeral: true });

        // Set timeout for confirmation
        const filter = i => i.customId === 'confirm' || i.customId === 'cancel';
        const collector = initialMessage.createMessageComponentCollector({ filter, time: 60_000 });

        collector.on('collect', async i => {
            if (i.customId === 'confirm') {
                const messageContent = `${taggedUser}`;
                const indEmbed = new EmbedBuilder()
                    .setTitle(`Introduce by ${interaction.user.tag} has been confirmed.`)
                    .setThumbnail(interaction.user.avatarURL({ dynamic: true })) // Update here
                    .setColor('#00FFFF')
                    .addFields(
                        { name: 'Nickname', value: userNickname},
                        { name: 'Age', value: userAge},
                        { name: 'Gender', value: userGender}
                    )
                    .setTimestamp();
            
                // Send updated Embed and delete buttons
                await initialMessage.delete();
                const targetChannel = interaction.guild.channels.cache.get('1152979594337599579');
                if (targetChannel) {
                    await targetChannel.send({ content: messageContent, embeds: [indEmbed] });
                } else {
                    console.log('Target channel not found.');
                }

                // Add new role and remove old role
                const member = await interaction.guild.members.fetch(interaction.user);
                const newRole = interaction.guild.roles.cache.get('1188480440223420548');
                const oldRole = interaction.guild.roles.cache.get('1236279675869986888');
                
                if (newRole) await member.roles.add(newRole);
                if (oldRole) await member.roles.remove(oldRole);
            } else if (i.customId === 'cancel') {
                await i.update({ content: 'Introduction cancelled.', embeds: [], components: [] });
            }
            
        });

        collector.on('end', collected => {
            if (collected.size === 0) interaction.editReply({ content: 'No confirmation received within the time limit, cancelling introduction.', components: [] });
        });
    },
}
