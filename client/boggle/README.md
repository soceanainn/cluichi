# Boggle

This is a basic implementation of Boggle as Gaeilge.

In order to update the list of accepted words, download the `.txt` file from [tearma.ie](https://www.tearma.ie/ioslodail/), 
and run this command in the `assets/` folder to update `focail.js`:

```bash
sh prep_focail.sh ~/PATH/TO/DOWNLOADED_FILE.txt
```

Suggested improvements to be made:
- Allow board sharing between players
- Allow various size boards
- Improve board generation (see `assets/boardGenerationUtils.js`)
- Implement 'high scores' for a player session
- Implement multiplayer functionality
