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

            let playerData = playersData?.find(user => user.user === interaction.member.user);

            /**
             * format of hangman cache:
             * 
             *      { user: , //interaction.member.user
             *        secretWord: ,
             *        guessedLetters: [],
             *        tries: 0,
             *        ended: false,
             *      },
             * 
             * format of russian roulette cache:
             * 
             *      { user: ,
             *        gun: ,
             *        shots: 0,
             *        died: false,
             *      }
             */


            // PLAY BUTTON (hangman)
            if (interaction.customId === 'hangmanplay' && interaction.isButton()) {
                let gameTries = playerData?.tries;
                let gameEnded = playerData?.ended;

                if (players.includes(interaction.member.user) && !gameEnded) {

                    const modal = new ModalBuilder()
                        .setCustomId('singleAlphabetModal')
                        .setTitle('Enter a single letter');

                    const singleLetterInput = new TextInputBuilder()
                        .setCustomId('letterInput')
                        .setLabel('Please enter a single letter (A-Z):')
                        .setStyle(TextInputStyle.Short)
                        .setMinLength(1)
                        .setMaxLength(1)
                        .setRequired(true);

                    const actionRow = new ActionRowBuilder()
                        .addComponents(singleLetterInput);

                    modal.addComponents(actionRow);

                    await interaction.showModal(modal);
                
                } else if (players.includes(interaction.member.user) && gameEnded) {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                    await interaction.editReply(`your game has ended already it took you ${gameTries} tries!`);
                } else {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                    await interaction.editReply("Time up! Or you are not in this game!");
                } 
            }

            // SHOOT button (russian roulette)
            if (interaction.customId === 'rouletteshoot' && interaction.isButton()) {
                let RRshots = playerData?.shots;
                let RRdead = playerData?.died;
                let RRgun = playerData?.gun;


                if (players.includes(interaction.member.user) && !RRdead) {
                    bulletUsed = RRgun.pop();

                    interaction.deferReply({ flags: MessageFlags.Ephemeral});
                    if (bulletUsed == "x") {
                        interaction.editReply("You are ded fr");
                        RRdead = true;
                    } else{
                        interaction.editReply("Lucky mf. +1 score");
                    }

                    // updating cache of player for next tries
                    const newPlayerData = {
                        user: playerData.user,
                        gun: RRgun,
                        shots: RRshots + 1,
                        died: RRdead,
                    }

                    const indexToUpdate = playersData.findIndex(player => player.user === playerData.user);
                    if (indexToUpdate !== -1) {
                        playersData[indexToUpdate] = newPlayerData;
                    }

                    client.cache.set(key, playersData);
                    console.log(playersData);

                } else {
                    interaction.deferReply({ flags: MessageFlags.Ephemeral });
                    interaction.editReply("Time up! or you are dead...")
                }
            }

            
            // MODALS HANDLER

            if (interaction.isModalSubmit() && players.includes(interaction.member.user)) {

                let playerData = playersData.find(user => user.user === interaction.member.user);

                const secretWord = playerData.secretWord;
                let guessedLetters = playerData.guessedLetters;
                let tries = playerData.tries;
                let ended = playerData.ended;

                if (interaction.customId === 'singleAlphabetModal' && !ended) {
                    const guessInput = interaction.fields.getTextInputValue('letterInput');

                    let newGuessedLetters = client.checkAndReturnHintArr(guessInput, secretWord, guessedLetters);

                    const endedBool = client.checkHangmanEnded(secretWord, newGuessedLetters);

                    if (endedBool) {
                        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                        await interaction.editReply(`GG you won! **word: ${newGuessedLetters.join('')}**`);
                    } else {
                        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                        await interaction.editReply(`continue! **HINT: ${newGuessedLetters.join(' ')}**`);
                    }

                    // updating cache of player for next tries
                    const newPlayerData = {
                        user: playerData.user,
                        secretWord: secretWord,
                        guessedLetters: newGuessedLetters,
                        tries: tries + 1,
                        ended: endedBool,
                    }

                    const indexToUpdate = playersData.findIndex(player => player.user === playerData.user);
                    if (indexToUpdate !== -1) {
                        playersData[indexToUpdate] = newPlayerData;
                    }

                    client.cache.set(key, playersData);

                } else if (interaction.customId === 'singleAlphabetModal' && ended) {

                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                    await interaction.editReply(`your game has ended already it took you ${tries} tries!`);
                }
            } 
        } catch (error) {
            console.log(`Error while hangman game: ${error}`);
        }
    }
};
