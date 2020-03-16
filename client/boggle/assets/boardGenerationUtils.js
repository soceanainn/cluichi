// Weight based on char appearance in dictionary
// let charMap = {"a": 69486, "i": 54990, "h": 41582, "c": 34750, "r": 34237, "t": 31328, "e": 27948, "n": 27821, "l": 26597, "s": 25468, "o": 22497, "m": 16642, "d": 13815, "í": 11916, "g": 11219, "á": 10929, "b": 9458, "p": 8366, "ó": 8096, "é": 7614, "f": 7154, "ú": 7093, "u": 6755, "v": 1080, "z": 557, "k": 356, "y": 243, "w": 173, "j": 161, "x": 148, "q": 92};

// Roughly normalised weight based on char appearance in dictionary
// let charMap = {"a": 3, "i": 3, "h": 3, "c": 3, "r": 3, "t": 3, "e": 3, "n": 3,"l": 3,"s": 3,"o": 3,"m": 2,"d": 2,"í": 2,"g": 2,"á": 2,"b": 1,"p": 1,"ó": 1,"é": 1,"f": 1,"ú": 1,"u": 1 };

let charMap = {"a": 1, "i": 1, "h": 1, "c": 1, "r": 1, "t": 1, "e": 1, "n": 1,"l": 1,"s": 1,"o": 1,"m": 1,"d": 1,"í": 1,"g": 1,"á": 1,"b": 1,"p": 1,"ó": 1,"é": 1,"f": 1,"ú": 1,"u": 1 };
let charMapSize = calculateMapSize();

function generateBoard() { // Generate new set of letters for board
    for (let i = 0; i < 16 ; i++) {
        document.getElementById(i.toString()).children[0].innerText = getChar();
    }
}

function calculateMapSize() { // Calculate sum of 'weights'
    let x = 0;
    for (k in charMap) x += charMap[k];
    return x;
}

function getChar() { // Select character randomly based on 'weight'
    let rand = Math.floor(Math.random() * charMapSize);
    for (const k in charMap) {
        if (rand <= charMap[k]) return k;
        else rand -= charMap[k];
    }
    return "a";
}
