const { Client, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require("discord.js");

function getRandomArrayValue(arr) {
  // Generate a random number between 0 (inclusive) and 1 (exclusive)
  const randomIndex = Math.floor(Math.random() * arr.length);

  // Return the element at the random index
  return arr[randomIndex];
}

class Two048 extends Client {
    
    cache = new Map();

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

module.exports = { Two048 };