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
        // ตรวจสอบว่าบอทอยู่ในห้องที่ต้องการหรือไม่
            if (interaction.channel.id !== "1152979349461553182") {
                await interaction.reply({ content: 'You cannot use this command in this channel.', ephemeral: true });
                    return;
                 }
            
            const userNickname = interaction.options.getString('nickname');
            const userAge = interaction.options.getString('age');
            const userGender = interaction.options.getString('gender');
            
            // แท็กผู้ใช้ในรูปแบบข้อความ
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
                
            // สร้าง Embed
            const embed = new EmbedBuilder()
                .setTitle(`Please confirm your introduction`)
                .setColor('#00FFFF')
                .addFields(
                    { name: 'Nickname', value: userNickname},
                    { name: 'Age', value: userAge},
                    { name: 'Gender', value: userGender}
                )
                .setThumbnail(interaction.user.avatarURL({ dynamic: true })) // แก้ไขที่นี่
                .setTimestamp();
                
            // ส่งข้อความและ Embed พร้อมกัน
        const initialMessage = await interaction.reply({ content: messageContent, embeds: [embed], components: [row], ephemeral: true });

        // กำหนดเวลาในการรอการยืนยัน
        const filter = i => i.customId === 'confirm' || i.customId === 'cancel';
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60_000 });

        collector.on('collect', async i => {
            if (i.customId === 'confirm') {
                const messageContent = `${taggedUser}`;
                const indEmbed = new EmbedBuilder()
                    .setTitle(`Introduce by ${interaction.user.tag} has been confirmed.`)
                    .setThumbnail(interaction.user.avatarURL({ dynamic: true })) // แก้ไขที่นี่
                    .setColor('#00FFFF')
                    .addFields(
                        { name: 'Nickname', value: userNickname},
                        { name: 'Age', value: userAge},
                        { name: 'Gender', value: userGender}
                    )
                    .setTimestamp();
            
                // ส่ง Embed ที่ถูกอัพเดตแล้ว และลบปุ่ม
                await interaction.deleteReply();
                const targetChannel = interaction.guild.channels.cache.get('1152979594337599579');
                if (targetChannel) {
                    await targetChannel.send({ content: messageContent, embeds: [indEmbed] });

                    // เพิ่มบทบาทใหม่และลบบทบาทเก่า
                    const member = await interaction.guild.members.fetch(interaction.user);
                    const newRole = interaction.guild.roles.cache.find(role => role.name === 'Family-Member');
                    //const oldRole = interaction.guild.roles.cache.find(role => role.name === 'OLD_ROLE_NAME');
                    if (newRole) await member.roles.add(newRole);
                    //if (oldRole) await member.roles.remove(oldRole);
                } else {
                    console.log('Target channel not found.');
                }
            } else if (i.customId === 'cancel') {
                await i.update({ content: 'Introduction cancelled.', embeds: [], components: [] });
            }
            
        });

        collector.on('end', collected => {
            if (collected.size === 0) interaction.editReply({ content: 'No confirmation received within the time limit, cancelling introduction.', components: [] });
        });
    },
}
