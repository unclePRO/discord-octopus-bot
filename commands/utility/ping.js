const { SlashCommandBuilder, PermissionFlagsBits, InteractionContextType, } = require('discord.js');

module.exports = {
    cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!')
        /*
        .addStringOption(option =>
            option.setName('input')
                .setDescription('The input to echo back')
                .setRequired(true)
                .addChoices(
				{ name: 'Funny', value: 'gif_funny' }, // name = displayed to user , value = what the bot will recieve
				{ name: 'Meme', value: 'gif_meme' },
				{ name: 'Movie', value: 'gif_movie' },
			    ))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to echo into'))
        .addBooleanOption(option =>
            option.setName('ephemeral')
                .setDescription('Whether or not the echo should be ephemeral'))
        .addSubcommand(subcommand =>
		    subcommand
                .setName('user')
                .setDescription('Info about a user')
                .addUserOption(option => option.setName('target').setDescription('The user')))
	    .addSubcommand(subcommand =>
		    subcommand
                .setName('server')
                .setDescription('Info about the server'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers) //permissions required
        */
	    .setContexts(InteractionContextType.Guild), // command only for guilds

	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};