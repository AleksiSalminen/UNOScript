
/* --------------------------------------------- */
/* Main settings and attributes for the frontend */
/* --------------------------------------------- */

let initialized = false;

const serverAddress = "http://localhost:3000";

let player;
let players;
let level;
let playerNumber;
let enemies;
let gameCode;
let gameActive = false;
let levelLoaded = false;

/**
 * Finds a certain player from a list of players
 * @param {*} plNumber 
 * @param {*} players 
 */
function findPlayer (plNumber, players) {
    for (let i = 0;i < players.length;i++) {
        let pl = players[i];
        if (pl.number === plNumber) {
            return pl;
        }
    }
}

/**
 * Initiates the game
 * @param {*} gameState 
 */
function initiateGame (gameState) {
    players = gameState.players;
    player = findPlayer(playerNumber, players);
    level = player.level;
    enemies = gameState.enemies;
    initialized = true;
    initiateGraphics();
}

/**
 * 
 */
function checkFullScreenBox () {
    let fullScreenBox = document.getElementById("fullScreenCheckBox");
    if (document.fullscreenElement && !fullScreenBox.checked) {
        fullScreenBox.checked = true;
    }
    else if (!document.fullscreenElement && fullScreenBox.checked) {
        fullScreenBox.checked = false;
    }
}

/**
 * 
 */
function updatePlayersStats () {
    let playersTable = document.getElementById("playersTable");
    let playersRow = "<tr><td>Player</td><td style='background-color:lightgrey'><b>" + player.name + "<b/></td>";
    let pHealthRow = "<tr><td>HP</td><td>" + player.health + "</td>";
    let pLocationRow = "<tr><td>Location</td><td>" + player.level.meta.name + "</td>";
    let pCoordinatesRow = "<tr><td>Coordinates</td><td>x: " + player.pos.x + ", y: " + player.pos.y + "</td>";
    for (let i = 0;i < players.length;i++) {
        let tPlayer = players[i];
        if (tPlayer.number !== player.number) {
            playersRow += "<td>" + tPlayer.name + "</td>";
            pHealthRow += "<td>" + tPlayer.health + "</td>";
            pLocationRow += "<td>" + tPlayer.level.meta.name + "</td>";
            pCoordinatesRow += "<td>x: " + tPlayer.pos.x + ", y: " + tPlayer.pos.y + "</td>";
        }
    }
    playersRow += "</tr>"; pHealthRow += "</tr>"; pLocationRow += "</tr>"; pCoordinatesRow += "</tr>";
    playersTable.innerHTML = playersRow + pHealthRow + pLocationRow + pCoordinatesRow;
}

/**
 * Updates the game
 * @param {*} playerNumber 
 * @param {*} gameState 
 */
function updateGame (playerNumber, gameState) {
    //console.log(gameState);
    players = gameState.players;
    player = findPlayer(playerNumber, players);
    checkFullScreenBox();
    updatePlayersStats();
    drawLevel();
}

