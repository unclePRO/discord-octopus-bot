# Discord Bot with MongoDB

A Discord game bot built with Node.js and Discord.js that is meant for large players at a single time

## Features
- Persistent data storage with MongoDB
- Best to use for large servers and host giveaways
- Plan to add 20+ games

## Tech Stack
- Node.js
- Discord.js
- MongoDB

## Setup
1. Clone the repo
2. `npm install`
3. Create `.env` file with your tokens (see `.env.example`)
4. `node index.js`

## Commands
- `/ping` - shows the bot ping in ms
- `/start` - starts the game -> shows JOIN screen for players to join -> then games start with players eliminating each round
