# Cluichi.ie --the website is currently down
## Games as Gaeilge*

This project stores the code behind the website [cluichi.ie](https://cluichi.ie).

The intention of this project is to create games in Irish and other minority languages. English is used as a standard
language while developing, and although the primary focus is on the Irish language, we are open to accepting contributions
enabling other minority languages.

### Useful Commands
Node.js and npm are required (see installation instructions [here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)).

- `node -v && npm -v`: verify that node.js and npm are installed
- `npm install`: install all dependencies required by the project
- `npm start`: starts the project, running at `localhost:2000`
- `npm run sitemap`: update sitemap

### Project Structure

- `client/`: Stores all client resources. The top level `assets/` directory contains general purpose / shared resources, with game specific 
resources stored in game specific subdirectories. Each game subdirectory should contain a README with specific details for that game.
- `game-server/`: Stores server side JS scripts, needed for multiplayer games. The `shared/` directory contains shared server side scripts.
Script names should match game subdirectory names from `client/`. 
- `scripts/`: Contains scripts used to generate resources needed by the project (e.g. sitemap generation script).
- `app.js`: Main server script.
