function createBoard(){ // Create HTML playing board
    for (let i = 0; i < 16 ; i++) {
        let div = document.createElement('div');
        let content = document.createElement('h3');
        div.className = "col-3 col-sm-2 col-md-1 col-lg-1 square";
        div.style.borderRadius = "10%";
        div.style.border = "2px solid #555";
        div.id = i.toString();
        content.innerText = i.toString();
        div.appendChild(content);
        document.getElementById("row" + Math.floor(i / 4)).appendChild(div);
        div.setAttribute("onclick", "select(" + i + ")");
    }
}

function restart(){ //Restart game
    document.getElementById("scoreboard").style.display = "block";
    document.getElementById("game-over").style.display = "none";
    generateBoard();
    wordsFound = [];
    score = 0;
    timeLeft = 180;

    for (let i = 0; i < 16 ; i++) {
        document.getElementById(i.toString()).setAttribute("onclick", "select(" + i + ")");
    }
}

function select(i) { // Select letter
    if (isConnected(i)) {
        selected.push(i);
        document.getElementById(i.toString()).className += " selected-letter";
        letters += document.getElementById(i.toString()).children[0].innerText.toString();
    }
}

function isConnected(i) { // Is letter selection valid
    let normalVals = [1,3,4,5];
    let leftSideOOB = [-1, -5, 3];
    let rightSideOOB = [1, 5, -3];
    if (selected.length === 0) return true;
    else if (selected.indexOf(i) !== -1) return false;
    else if (i % 4 === 0 && leftSideOOB.indexOf(selected[selected.length-1] - i) !== -1) return false;
    else if (i % 4 === 3 && rightSideOOB.indexOf(selected[selected.length-1] - i) !== -1) return false;
    else return normalVals.indexOf(Math.abs(selected[selected.length-1] - i)) !== -1;
}

function reset(){ //Reset letter selection
    selected = [];
    letters = "";
    for (let i = 0; i < 16 ; i++) {
        document.getElementById(i.toString()).className = "col-3 col-sm-2 col-md-1 col-lg-1 square";
    }
}

function submit(){ //Submit selected letters
    if (wordsFound.indexOf(letters) === -1) {
        if (focail.indexOf(letters) !== -1) {
            score += getScore(letters.length);
            wordsFound.push(letters);
            document.getElementById("score").innerText = "Scór: " + score;
            document.getElementById("found").innerHTML += '<a class="text-dark" target="_blank" href="https://www.teanglann.ie/ga/fgb/' + encodeURI(letters)+ '">' + letters + '</a> ';
        } else alert("Ní focal é/í '" + letters + "'");
    } else alert("D'aimsigh tú an focal '" + letters + "' cheana");
    reset();
}

function getScore(i) { // Scoring logic for Boggle
    if (i < 3) return 0;
    switch(i) {
        case 3: return 1;
        case 4: return 2;
        case 5: return 3;
        case 6: return 4;
        case 7: return 5;
        default: return 6;
    }
}

function countdown() { // Game timer countdown
    timeLeft -= 1;
    if (timeLeft < 0) {
        reset();
        document.getElementById("scoreboard").style.display = "none";
        document.getElementById("game-over").style.display = "block";
        document.getElementById("time").innerText = "Tá an cluiche thart!";

        for (let i = 0; i < 16 ; i++) {
            document.getElementById(i.toString()).removeAttribute("onclick");
        }
    } else document.getElementById("time").innerText = "Am Fágtha: " + timeLeft + "s";
}
