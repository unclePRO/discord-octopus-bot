const { Client, Interaction, ButtonBuilder, ButtonStyle, ApplicationCommandOptionType, ActionRowBuilder, SlashCommandBuilder, PermissionFlagsBits, InteractionContextType, } = require('discord.js');


module.exports = {
    cooldown: 60,
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Start the game of octopus.')
	    .setContexts(InteractionContextType.Guild), // command only for guilds

    /**
     * @param {Client} client
     * @param {Interaction} interaction
     */

	async execute(interaction) {
		const client = interaction.client
        if (!interaction.inGuild()) {
            await interaction.reply("Not available in DM");
            return;
        }

        try {
            await interaction.deferReply();

            const join = new ButtonBuilder()
                .setCustomId('join')
                .setLabel('Join')
                .setStyle(ButtonStyle.Primary);
    
            const leave = new ButtonBuilder()
                .setCustomId('leave')
                .setLabel('Leave')
                .setStyle(ButtonStyle.Secondary);
            
            const start = new ButtonBuilder()
                .setCustomId('start')
                .setLabel('Start')
                .setStyle(ButtonStyle.Success);
    
            const row = new ActionRowBuilder()
                .addComponents(join, leave, start);
    
            await interaction.editReply({
                content: "Start the octopus game...",
                components: [row],
            });

            //console.log(client.startMessage.interaction.id);
            client.cache.set(interaction.id, []);

        } catch (error) {
            console.log(`error with start command: ${error}`);
        }
	},
};