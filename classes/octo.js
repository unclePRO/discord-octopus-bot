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

/**
 *  2048 functions
 *  below
 */ 
    async init2048(user) {
        let matrix = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        return new Promise(resolve => {
            setTimeout(() => {
            const gameData = {
                user,
                matrix,
                turns: 0,
                ended: false,
                next: {
                    up: true,
                    down: true,
                    left: true,
                    right: true,
                },
            };   

            console.log(`2048 Game initialized for user ${user.globalName}`);
            resolve(gameData);
            }, 2000);
        });    
    };

    async start2048(users, Msg2048, client) {
        try {
            const gameInitializationPromises = users.map(async user => {
                return client.init2048(user);
            });
            const allGameData = await Promise.all(gameInitializationPromises);

            await client.cache.set(
                Msg2048,
                allGameData
            )

            console.log("All 2048 games started");
            return allGameData;

        } catch (error) {
            console.error("Error starting 2048 games:", error);
        }
    };

    locateZero (matrix) { //return array of indices of zeros' location
        let zeroArray = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (matrix[i][j] == 0) {
                    zeroArray.push([i, j]);
                }
            }
        }
        return zeroArray;
    }

    randomTwo(matrix) {
        let newMatrix = matrix;
        let zeroArray = client?.locateZero(matrix);
        let randomIndex = getRandomArrayValue(zeroArray); //ex: [1, 2]
        let i = randomIndex[0];
        let j = randomIndex[1];
        if (zeroArray) {
            newMatrix[i][j] = 2;
        } 
        return newMatrix;
    }

    rotateMatrixCW(matrix) {
        let newMatrix = matrix;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                newMatrix[i][j] = matrix[j][3 - i];
                }
            }
    }

    rotateMatrixACW(matrix) {
        let newMatrix = matrix;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                newMatrix[i][j] = [3 - i - j][i];
            }
        }    
    }

    mergeUp(matrix) {
        let newMatrix = matrix;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (matrix[i][j] == matrix[i + 1][j]) {
                    newMatrix[i][j] *= 2;
                    newMatrix[i + 1][j] = 0;
                }
            }
        }
    }

    mergeDown(matrix) {
        let newMatrix = matrix;
        client.rotateMatrixCW(newMatrix);
        client.rotateMatrixCW(newMatrix);
        client.mergeUp(newMatrix);
        client.rotateMatrixACW(newMatrix);
        client.rotateMatrixACW(newMatrix);
        
        return newMatrix;
    }

    mergeLeft(matrix) {
        let newMatrix = matrix;
        client.rotateMatrixCW(newMatrix);
        client.mergeUp(newMatrix);
        client.rotateMatrixACW(newMatrix);
    }

    mergeRight(matrix) {
        let newMatrix = matrix;
        client.rotateMatrixACW(newMatrix);
        client.mergeUp(newMatrix);
        client.rotateMatrixCW(newMatrix);
    }

    moveUp(matrix) {
        let newMatrix = matrix;
        client.mergeUp(newMatrix);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (newMatrix[i][j] == 0) {
                    newMatrix[i][j] = newMatrix[i + 1][j];
                    newMatrix[i + 1][j] = 0;
                }
            }
        }
    }

    moveDown(matrix) {
        let newMatrix = matrix;
        client.rotateMatrixCW(newMatrix);
        client.rotateMatrixCW(newMatrix);
        client.mergeUp(newMatrix);
        client.moveUp(newMatrix);
        client.rotateMatrixACW(newMatrix);
        client.rotateMatrixACW(newMatrix);
    }

    moveLeft(matrix) {
        let newMatrix = matrix;
        client.rotateMatrixCW(newMatrix);
        client.mergeUp(newMatrix);
        client.moveUp(newMatrix);
        client.rotateMatrixACW(newMatrix);
    }

    moveRight(matrix) {
        let newMatrix = matrix;
        client.rotateMatrixACW(newMatrix);
        client.mergeUp(newMatrix);
        client.moveUp(newMatrix);
        client.rotateMatrixCW(newMatrix);
    }
    
}

module.exports = { Octo };