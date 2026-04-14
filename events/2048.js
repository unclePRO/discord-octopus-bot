const { Client, Events, Interaction, MessageFlags, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');

/**
 * 
 * @param {Client} client 
 * @param {Interaction} interaction 
 */
module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        const client = interaction.client;
    
        try {
            if (!interaction.inGuild()) return;
            if (!interaction.isModalSubmit() && !interaction.isButton()) return;

            const key = interaction.message.id;

            let playersData = await client.cache.get(key); //below given format
            let players = []; //array of users only

            if (playersData?.length > 0) {
                for (const playerData of playersData) {
                    players.push(playerData.user);
                }
            }
            
            console.log(playersData);
            let playerData = playersData?.find(user => user.user === interaction.member.user);

            /**
             *  format of 2048 cache
             *      {
             *           user,
             *           matrix,
             *           turns: 0,
             *           ended: false,
             *           next: {
             *               up: true,
             *               down: true,
             *               left: true,
             *               right: true,
             *           }
             */

            // 2048 play button
            if (interaction.customId === 'play2048' && interaction.isButton()) {
                console.log("ok");
                let matrix2048 = playerData?.matrix;
                let ended2048 = playerData?.ended;
                let turns2048 = playerData?.turns;
                let next2048 = playerData?.next;
                console.log(playerData);

                const up2048 = new ButtonBuilder()
                    .setCustomId("up2048")
                    .setLabel("⬆️")
                    .setStyle(ButtonStyle.Primary);
                const down2048 = new ButtonBuilder()
                    .setCustomId("down2048")
                    .setLabel("⬇️")
                    .setStyle(ButtonStyle.Primary);
                const left2048 = new ButtonBuilder()
                    .setCustomId("left2048")
                    .setLabel("⬅️")
                    .setStyle(ButtonStyle.Primary);
                const right2048 = new ButtonBuilder()
                    .setCustomId("right2048")
                    .setLabel("➡️")
                    .setStyle(ButtonStyle.Primary);
                
                const row2048 = new ActionRowBuilder()
                    .addComponents(up2048, down2048, left2048, right2048);

                //if (players.includes(interaction.member.user) && !ended2048) {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                    const Msg2048 = await interaction.editReply({
                        content: `${matrix2048}`,
                        components: [row2048],
                    });
                    console.log(matrix2048);
                //}
            }
            // MODALS HANDLER

            if (interaction.isModalSubmit() && players.includes(interaction.member.user)) {

            } 
        } catch (error) {
            console.log(`Error while hangman game: ${error}`);
        }
    }
};
