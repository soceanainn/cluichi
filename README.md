# Games as Gaeilge

To start run `node app.js` and visit: `localhost:2000`

Games List:
* CartaiVsDaonnachta (Cards Against Humanity)
* Boggle
* [In Progress] Éire Aontaithe (Risk Ireland)

## CartaiVsDaonnachta
Cards Against Humanity Clone, with in-game and universal chat.

Uses Node.js, Express and Socket.io

### To-Do:
- Fix bugs (currently broken)
- Add more questions (question sparsity limits the number of players who can play per game)
- Make responsive (better support for phones)
- Account for questions that require two answers
- Allow blank cards
- Make the design more modular so that it can be used as a template for more games

## Boggle
Boggle clone, using Irish dictionary taken from [tearma.ie](tearma.ie).

### To-Do:
- Allow board sharing
- Improve board generation
- Implement 'high scores'
- Implement multiplayer functionality

## Risk
Risk clone, based on map of Irish counties

### To-Do:
- Add harbour logos for travel by sea
- Add neighbouring counties
- Add mouseover / click events for county 'board spaces'
- Implement game logic
- Implement multiplayer functionality