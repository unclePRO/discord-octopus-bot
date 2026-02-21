const {Events, Collection, Client, Interaction, MessageFlags, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');
const { devs, testServer} = require('../config.json');

/**
 * 
 * @param {Client} client 
 * @param {Interaction} interaction 
 */
module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {

        const client = interaction.client
        try {
            if (!interaction.inGuild()) return;
            if (!interaction.isButton()) return;

            // JOIN BUTTON

            if (interaction.customId === 'join') {

                const parentInteractionID = interaction.message.interaction.id;
                //console.log(parentInteractionID);
                let playerList = client.cache.get(parentInteractionID);

                if (!playerList.includes(interaction.member.user)) {
                    await playerList.push(interaction.member.user);

                    await interaction.deferReply({ flags: MessageFlags.Ephemeral },);
                    await interaction.editReply({content: 'You joined the game!'});
                    await interaction.message.edit(`**Participants**: ${playerList}`);

                    client.cache.set(parentInteractionID, playerList);
                    return;
                } else {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                    await interaction.editReply("You have already joined the game!");
                    return;
                }
            }

            // LEAVE button
            if (interaction.customId === 'leave') {
                const parentInteractionID = interaction.message.interaction.id;
                let playerList = client.cache.get(parentInteractionID);
                if (playerList.includes(interaction.member.user)) {
                    playerList = playerList.filter( player => player !== interaction.member.user);

                    await interaction.message.edit(`**Participants**: ${playerList}`);

                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                    await interaction.editReply("You left the game!");

                    client.cache.set(parentInteractionID, playerList);
                    return;
                } else {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                    await interaction.editReply("You cant leave without joining first :skull:!");
                    return;
                }
            }

            // START button
            if (interaction.customId === 'start') {
                const parentInteractionID = interaction.message.interaction.id;
                let playerList = client.cache.get(parentInteractionID);

                const numOfPlayers = playerList?.length;

                //checking number of players
                if (numOfPlayers < 1) {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                    await interaction.editReply("Need at least 2 players to start!");
                } else {
                    
                    const row = new ActionRowBuilder()
                        .addComponents(
                            ButtonBuilder.from(interaction.component) // Create a new ButtonBuilder from the clicked button
                                .setDisabled(true), // Disable the button
                        );

                    await interaction.message.edit({ 
                        content: `# Starting the octopus game...\n## PLAYERS: \n${playerList}`,
                        components: [row] }); // Update the message with the disabled button
                

                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////fr
                    let players = playerList; // array of objects of each player
                    //testing:
                    //let players = ['A', 'B', 'C', 'D', 'E',];
                    let gameList = ['2048',];
                    let roundNo = 0;
                    
                    while (roundNo > -1) {
                        let numberOfPlayers = players.length;
                        if (roundNo >= 1) {
                            await interaction.channel.send(`ROUND ${roundNo} summary: \n players alive: ${players}`);
                        }
                        
                        roundNo++;
                        let [gameName, newList] = client.randomGame(gameList); 
                        gameList = newList;

                        let roundMsg = await interaction.channel.send(`**Round ${roundNo} starts...**`);

                        switch (gameName) {
                            ///////////////////// COINFLIP
                            case 'coinflip':
                                
                                //make num of players even
                                if (!((numberOfPlayers % 2 === 0) && (numberOfPlayers === 1))) {
                                    let [newArray, killedMem] = client.killRandom(players);
                                    players = newArray;

                                    await roundMsg.reply(`${killedMem} was killed :skull:.`);
                                    await client.delay(5000);
                                    //5 second delay here
                                }
                                const groups = client.groupTwo(players);

                                await roundMsg.reply(`Groups are as follows: ${groups}`);

                                const [coinFlipWinners, coinFlipLosers] = client.coinFlip(groups);
                                players = coinFlipWinners;

                                let i = 0;
                                while (i < groups.length) {
                                    await roundMsg.reply(`Group ${i + 1}: \nFlipping coin...\n:coin: ${coinFlipWinners[i]} won, :skull: ${coinFlipLosers[i]} died!`);
                                    //Send ephemeral to ded ppl or DM
                                    await client.delay(3000);
                                    i++;
                                    console.log("loop working");
                                }
                                console.log("loop end"); 
                                break;
                        
                            ///////////////////// HANGMAN /////////////// kill 25% players
                            case 'hangman': 
                                
                                const hangmanPlay = new ButtonBuilder()
                                    .setCustomId('hangmanplay')
                                    .setLabel('Play')
                                    .setStyle(ButtonStyle.Success);

                                const hangmanRow = new ActionRowBuilder()
                                    .addComponents(hangmanPlay);

                                await interaction.deferReply();
                                const hangmanMsg = await interaction.followUp({
                                    content: `Round ${roundNo}. Game: HANGMAN\nCLICK THE BUTTON BELOW TO PLAY the game of hangman! (5 minutes game time)!`,
                                    components: [hangmanRow],
                                });

                                // starting game for each player 
                                // also setting cache in hangmanMsg.id
                                await client.startHangmanGamesForUsers(players, hangmanMsg.id, client);

                                await client.delay(60000); // game time (delete cache after this)
                                await hangmanMsg.channel.send("TIME UP kids");

                                let hangmanData = client.cache.get(hangmanMsg.id);
                                let playersWonHM = hangmanData.filter(playerData => playerData.ended === true);
                                let playersLostHM = hangmanData.filter(playerData => playerData.ended === false);

                                await client.cache.delete(hangmanMsg.id); //delete cache (since completed game players saved above)
                                console.log('time up! hangman game cache deleted')

                                // killing players now
                                const numOfPlayersHMinitial = hangmanData.length;
                                const numOfPlayersHMwon = playersWonHM.length;
                                const numOfPlayersHMLost = playersLostHM.length;
                                const numToKillHM = Math.floor(numOfPlayersHMinitial / 4);

                                playersWonHM.sort((a, b) => b.tries - a.tries);

                                let leaderboardTriesHM = ''; // leaderboard string (wrt no. of tries)
                                for (const playerData of playersWonHM) {
                                    let rankNum = playersWonHM.findIndex(player => player === playerData);
                                    leaderboardTriesHM += `${rankNum}. ${playerData.user} => ${playerData.tries} tries\n`;
                                }

                                

                                if (numToKillHM <= numOfPlayersHMLost && numToKillHM > 3) { // when not ended ppl are more than or equal to 25%
                                    await hangmanMsg.channel.send(`killed loser players :skull:: ${playersLostHM}`);
                                    await client.delay(2000);
                                    await hangmanMsg.channel.send(`Hangman leaderboard: \n${leaderboardTriesHM}`);
                                    
                                } else if (numToKillHM > numOfPlayersHMLost && numToKillHM > 3) { // when not ended ones arent enough, kill more acc to tries
                                    const numOfExtras = numToKillHM - numOfPlayersHMLost;
                                    //playersWonHM.splice(-numOfExtras, numOfExtras);
                                    let killedPlayersByRank = [];
                                    for (let i = 0; i < numOfExtras; i++) {
                                        killedPlayersByRank.push(playersWonHM.pop());
                                    }
                                    
                                    await hangmanMsg.channel.send(`killed loser players :skull:: ${playersLostHM}`);
                                    await client.delay(2000);
                                    await hangmanMsg.channel.send(`Hangman leaderboard: \n${leaderboardTriesHM}`);
                                    await hangmanMsg.channel.send(`killed noob players :skull:: ${killedPlayersByRank}`);

                                } else  if (numOfPlayersHMLost === 0 && numOfPlayersHMinitial <= 3) {
                                    const killedNigma = playersWonHM.pop();
                                    await client.delay(2000);
                                    await hangmanMsg.channel.send(`Hangman leaderboard: \n${leaderboardTriesHM}`);
                                    await hangmanMsg.channel.send(`killed 1 player from bottom :skull:: ${killedNigma.user}`);
                                } else {
                                    await client.delay(2000);
                                    await hangmanMsg.channel.send(`Hangman leaderboard: \n${leaderboardTriesHM}\nRound end...`);
                                }

                                await client.delay(5000);
                                
                                players = playersWonHM; // final step!
                                break;

                            ///////////////////// RUSSIAN ROULETTE
                            case 'russianroulette':
                                const RRPlay = new ButtonBuilder()
                                    .setCustomId('rouletteshoot')
                                    .setLabel('Shoot')
                                    .setStyle(ButtonStyle.Danger);

                                const RRRow = new ActionRowBuilder()
                                    .addComponents(RRPlay);

                                await interaction.deferReply();
                                const RRMsg = await interaction.followUp({
                                    content: `Round ${roundNo}. Game: RR\nCLICK THE BUTTON BELOW TO SHOOT Yourself! (5 minutes game time)!`,
                                    components: [RRRow],
                                });

                                // starting game for each player 
                                // also setting cache in RRMsg.id
                                await client.startRussianRoulette(players, RRMsg.id, client);
                                client.delay(10000);
                                break;

                            ///////////////////// 2048 (ffa)
                            case '2048':
                                const play2048 = new ButtonBuilder()
                                    .setCustomId("play2048")
                                    .setLabel("Play")
                                    .setStyle(ButtonStyle.Primary);
                                
                                const row2048 = new ActionRowBuilder()
                                    .addComponents(play2048);

                                await interaction.deferReply();
                                const Msg2048 = await interaction.followUp({
                                    content: `Round ${roundNo}. Game: 2048\nClick the button to start the game of 2048!`,
                                    components: [row2048],
                                });

                                await client.start2048(players, Msg2048, client);
                                client.delay(100000);
                                break;

                            ///////////////////// rock paper scissors
                            case 'rockpaperscissor':

                                break;

                        
                            ///////////////////// tug o war (teams)
                            case 'tugowar':

                                break;

                        
                            ///////////////////// red light green light (ffa)
                            case 'redlightgreenlight':

                                break;

                            ///////////////////// tic tac toe (1v1)
                            case 'tictactoe':

                                break;
                            
                            default:
                                break;
                        }


                        
                        //check winner here
                        const [winnerExists, winner] = client.someoneWon(players);
                        client.cache.set(parentInteractionID, players);
                        //console.log('players alive:', client.cache.get(parentInteractionID));
                        if (winnerExists) {
                            await interaction.channel.send(`# ${winner} won! :skull::skull:`);
                            client.cache.delete(parentInteractionID);
                            return;
                        } else {
                            return;
                        }

                    }
                }

            }
        } catch (error) {
            console.log(`Error while event startGame.js: ${error}`);
        }
    }
};
