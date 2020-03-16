function drawCircles(){
    for (const l in leinster) drawCircle(leinster[l].x, leinster[l].y, 1, 0);
    for (const m in munster) drawCircle(munster[m].x, munster[m].y, 10, 1);
    for (const c in connaught) drawCircle(connaught[c].x, connaught[c].y, 3, 2);
    for (const u in ulster) drawCircle(ulster[u].x, ulster[u].y, ulster[u].troops, ulster[u].owner);
}

function drawCircle(x, y, number, owner) {
    ctx.beginPath();
    ctx.arc(x * ratio, y * ratio, 10, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#FFF';
    ctx.fill();
    ctx.lineWidth = 5;

    ctx.strokeStyle = ownerColor(owner);
    ctx.stroke();

    drawTroopNumbers(number, x, y);
}

function ownerColor(owner) {
    switch(owner){
        case 0: return 'green';
        case 1: return 'blue';
        case 2: return 'orange';
        default: return 'grey';
    }
}

function drawTroopNumbers(number, x, y) {
    if (number !== null) {
        ctx.beginPath();
        ctx.fillStyle = '#000';
        if (number < 10) ctx.fillText(number.toString(), (x * ratio) - 2.5, (y * ratio) + 3);
        else ctx.fillText(number.toString(), (x * ratio) - 5, (y * ratio) + 3);
        ctx.fill();
    }
}
