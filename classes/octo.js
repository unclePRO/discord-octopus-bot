const { Client, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require("discord.js");

function getRandomArrayValue(arr) {
  // Generate a random number between 0 (inclusive) and 1 (exclusive)
  const randomIndex = Math.floor(Math.random() * arr.length);

  // Return the element at the random index
  return arr[randomIndex];
}

class Octo extends Client {
    
    cache = new Map();

    randomizePlayers(playerArray) {
        let tempPlayerArray = playerArray;
        let n = 0;
        let players = [];

        while (n < playerArray.length) {
            const randomPlayer = getRandomArrayValue(tempPlayerArray);
            players.push(randomPlayer);
            tempPlayerArray = tempPlayerArray.filter(player => player !== randomPlayer);
            n = n + 1;
        }
        return players;
    };

    //make players even
    killRandom(playerArray) {
        const random = getRandomArrayValue(playerArray);
        const newArray = playerArray.filter(player => player !== random);
        return [newArray, random];
    };

    //make group of 2 ppl
    groupTwo(playerArray) {
        let temp = playerArray;
        const length = playerArray.length;
        let groupedPlayersArray = [];
        let n = 0;

        while (n < (length / 2)) {
            let random1 = getRandomArrayValue(temp);
            let temp2 = temp.filter(x => x !== random1);
            let random2 = getRandomArrayValue(temp2);
            let temp3 = temp2.filter(y => y !== random2);

            groupedPlayersArray.push([random1, random2]);
            n++;
            temp = temp3;
        }

        return groupedPlayersArray;
    };

    //return array of killed and alive players
    killedAndAlivePlayers(PlayersBeforeGame, PlayersAfterGame) { //0 = killed players, 1 = alive players
        let killedPlayersArray = [];
        let alivePlayersArray = [];

        for (player of PlayersBeforeGame) {
            if (PlayersAfterGame.has(player)) {
                alivePlayersArray.push(player);
            } else {
                killedPlayersArray.push(player);
            }
        }
        return [killedPlayersArray, alivePlayersArray];
    };

    //Choose random game and then delete it from list
    randomGame(gameList) {
        const randGame = getRandomArrayValue(gameList);
        const newList = gameList.filter(game => game !== randGame);

        return [randGame, newList];
    };

    // coin flip game
    coinFlip(groupedPlayerArray) { // kill 50% players
        let groupS = groupedPlayerArray; // [[A, B], [C, D]]
        let winnerArray = [];
        let loserArray = [];

        for (const group of groupS) {
            const rand = getRandomArrayValue(group);
            winnerArray.push(rand);
            x = group.filter(plyr => plyr !== rand);
            x = x[0]
            loserArray.push(x);
        }
        return [winnerArray, loserArray];

    };

    //delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    someoneWon(playersArray) {
        let someonewon = false;
        const numOfPlayers = playersArray.length;

        if (numOfPlayers === 1) {
            someonewon = true;
            let winner = playersArray[0];
            return [someonewon, winner];
        } else {
            someonewon = false;
            let winner = "DOES NOT EXIST";
            return [someonewon, winner];
        }
    };

    //trying promise.all() => code taken from google ai
    //
    //
    async getRandomWord() {
        return new Promise(resolve => {
            setTimeout(() => {
            const words = ["javascript", "hangman", "promise", "concurrency", "gay", "q", "happy", "cat"]; // word list for hangman #####################
            const randomIndex = Math.floor(Math.random() * words.length);
            resolve(words[randomIndex]);
            }, 500); // Simulate API call delay
        });
    };

    async initializeHangmanGame(user, secretWord) {
        return new Promise(resolve => {
            setTimeout(() => {
            const gameData = {
                user,
                secretWord,
                guessedLetters: '#'.repeat(secretWord.length).split(''),
                tries: 0,
                ended: false,
            };   

            console.log(`Game initialized for user ${user.globalName} with word: ${secretWord}`);
            resolve(gameData);
            }, 2000); // Simulate database/cache operation
        });
    };

    async startHangmanGamesForUsers(users, hangmanMsgID, client) {
        try {
            const gameInitializationPromises = users.map(async user => {
                const secretWord = await client.getRandomWord(); // Get a word for each user
                return client.initializeHangmanGame(user, secretWord); // Initialize game
            });

            // Wait for all game initializations to complete concurrently
            const allGameData = await Promise.all(gameInitializationPromises);

            await client.cache.set( // to access it in modal folder fr
                hangmanMsgID,
                allGameData,
            )

            console.log("All Hangman games started");
            return allGameData;
        } catch (error) {
            console.error("Error starting Hangman games:", error);
        }
    };

    checkAndReturnHintArr (inputLetter, secretWord, guessedLetters) {

        let secretWordArr = secretWord.split('');
        let length = secretWordArr.length;

        for (let i = 0; i < length; i++) {
            if (inputLetter === secretWordArr[i]) {
                guessedLetters[i] = inputLetter;
            }
        }
        return guessedLetters;
    };

    checkHangmanEnded (secretWord, guessedArray) {
        const guessedWord = guessedArray.join('');

        // if no #s left and word guessed fully then game ended
        if (guessedWord === secretWord) {
            return true; //ended
        } else {
            return false;
        }
    }

    async createGun() {
        return new Promise(resolve => {
            setTimeout(() => {
            let gun = ["o", "o", "o", "o", "o", "o", ]; // word list for hangman #####################
            const randomIndex = Math.floor(Math.random() * gun.length);
            gun[randomIndex] = "x"
            resolve(gun);
            }, 500); // Simulate API call delay
        });
    };

    async initializeRussianRoulette(user, gun) {
        return new Promise(resolve => {
            setTimeout(() => {
            const gameData = {
                user,
                gun,
                shots: 0,
                died: false,
            };   

            console.log(`RR Game initialized for user ${user.globalName}`);
            resolve(gameData);
            }, 2000); // Simulate database/cache operation
        });
    };

    async startRussianRoulette(users, RRMessageID, client) {
        try {
            const gameInitializationPromises = users.map(async user => {
                const gun = await client.createGun(); // load the gun
                return client.initializeRussianRoulette(user, gun); // Initialize game
            });

            // Wait for all game initializations to complete concurrently
            const allGameData = await Promise.all(gameInitializationPromises);

            await client.cache.set( // to access it in modal folder fr
                RRMessageID,
                allGameData
            )

            console.log("All Hangman games started");
            return allGameData;
        } catch (error) {
            console.error("Error starting Hangman games:", error);
        }
    };

    // ROCK PAPER SCISSORS
    async initializeRockPaperScissors(user) {
        return new Promise(resolve => {
            setTimeout(() => {
            const gameData = {
                user,
                enemy,
                turn: 0, // 1 = rock, 2 = paper, 3 = scissor
                died: false,
            };   

            console.log(`RPScissor Game initialized for user ${user.globalName}`);
            resolve(gameData);
            }, 2000); // Simulate database/cache operation
        });
    };

    async startRockPaperScissors(users, RRMessageID, client) {
        try {
            const gameInitializationPromises = users.map(async user => {
                return client.initializeRussianRoulette(user); // Initialize game
            });

            // Wait for all game initializations to complete concurrently
            const allGameData = await Promise.all(gameInitializationPromises);

            await client.cache.set( // to access it in modal folder fr
                RRMessageID,
                allGameData
            )

            console.log("All Hangman games started");
            return allGameData;
        } catch (error) {
            console.error("Error starting Hangman games:", error);
        }
    };






    
}



module.exports = { Octo };