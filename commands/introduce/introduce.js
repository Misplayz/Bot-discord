async execute(interaction) {
    // Check if the interaction is in the correct channel
    if (interaction.channel.name !== '👤-introduce') {
        await interaction.reply({ content: 'You cannot use this command in this channel.', ephemeral: true });
        return;
    }

    const userNickname = interaction.options.getString('nickname');
    const userAge = interaction.options.getString('age');
    const userGender = interaction.options.getString('gender');
    const taggedUser = interaction.user.toString();

    const messageContent = `Please confirm your introduction by clicking one of the buttons below.`;

    const confirmButton = {
        customId: 'confirm',
        label: 'Confirm',
        style: 'SUCCESS'
    };

    const cancelButton = {
        customId: 'cancel',
        label: 'Cancel',
        style: 'SECONDARY'
    };

    const components = [
        {
            type: 'ACTION_ROW',
            components: [confirmButton, cancelButton]
        }
    ];

    const embed = new MessageEmbed()
        .setTitle(`Please confirm your introduction`)
        .setColor('#00FFFF')
        .addFields(
            { name: 'Nickname', value: userNickname },
            { name: 'Age', value: userAge },
            { name: 'Gender', value: userGender }
        )
        .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
        .setTimestamp();

    const initialMessage = await interaction.reply({ content: messageContent, embeds: [embed], components: components, ephemeral: true });

    const filter = (i) => i.isButton() && (i.customId === 'confirm' || i.customId === 'cancel');
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (i) => {
        if (i.customId === 'confirm') {
            const messageContent = `${taggedUser}`;
            const indEmbed = new MessageEmbed()
                .setTitle(`Introduce by ${interaction.user.tag} has been confirmed.`)
                .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
                .setColor('#00FFFF')
                .addFields(
                    { name: 'Nickname', value: userNickname },
                    { name: 'Age', value: userAge },
                    { name: 'Gender', value: userGender }
                )
                .setTimestamp();

            await interaction.deleteReply();
            const targetChannel = interaction.guild.channels.cache.get('1152979594337599579');
            if (targetChannel) {
                await targetChannel.send({ content: messageContent, embeds: [indEmbed] });

                const member = await interaction.guild.members.fetch(interaction.user);
                const newRole = interaction.guild.roles.cache.find(role => role.name === 'Family-Member');
                if (newRole) await member.roles.add(newRole);
            } else {
                console.log('Target channel not found.');
            }
        } else if (i.customId === 'cancel') {
            await i.update({ content: 'Introduction cancelled.', embeds: [], components: [] });
        }
    });

    collector.on('end', (collected) => {
        if (collected.size === 0) interaction.editReply({ content: 'No confirmation received within the time limit, cancelling introduction.', components: [] });
    });
}
