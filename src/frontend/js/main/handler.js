
import { GRAPHICS } from './graphics.js'
import { KEYBOARD } from './keyboard.js'; 

const serverAddress = "http://localhost:3000";

let player;
let playerNumber;
let players;
let enemies;
let level;
let gameCode;
let initialized = false;
let gameActive = false;

/* Establish socket connection with the server backend */
const socket = io(serverAddress);

/* Set the socket message listeners */
socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("teleport", handleTeleport);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);

/**
 * Finds a certain player from a list of players
 * @param {*} plNumber 
 * @param {*} players 
 */
 function findPlayer(plNumber, players) {
  for (let i = 0; i < players.length; i++) {
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
function initiateGame(gameState) {
  players = gameState.players;
  player = findPlayer(playerNumber, players);
  level = player.level;
  enemies = gameState.enemies;
  GRAPHICS.initiateGraphics(level, player, players);
  initialized = true;
}

/**
* 
*/
function checkFullScreenBox() {
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
function updatePlayersStats() {
  let playersTable = document.getElementById("playersTable");
  let playersRow = "<tr><td>Player</td><td style='background-color:lightgrey'><b>" + player.name + "<b/></td>";
  let pHealthRow = "<tr><td>HP</td><td>" + player.health + "</td>";
  let pLocationRow = "<tr><td>Location</td><td>" + player.level.meta.name + "</td>";
  let pCoordinatesRow = "<tr><td>Coordinates</td><td>x: " + player.pos.x + ", y: " + player.pos.y + "</td>";
  for (let i = 0; i < players.length; i++) {
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
function updateGame(playerNumber, gameState) {
  //console.log(gameState);
  players = gameState.players;
  player = findPlayer(playerNumber, players);
  checkFullScreenBox();
  updatePlayersStats();
  GRAPHICS.drawLevel(player, players);
}

/**
 * Adds a listener to the fullscreen checkbox
 */
document.getElementById('fullScreenCheckBox').addEventListener('change', function (event) {
  const checked = event.target.checked;
  if (checked) {
    let element = document.body;
    // Supports most browsers and their versions.
    let requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;
  
    if (requestMethod) { // Native full screen.
        requestMethod.call(element);
    }
    else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
        let wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
  }
  else {
    document.exitFullscreen();
  }
});

/**
 * Adds a listener to the resolution select tag
 */
document.getElementById("resolutionSelect").addEventListener('change', function (event) {
  const newValue = event.target.value;
  if (newValue === "624x351") {
    GRAPHICS.changeResolution(624, 351);
  }
  else if (newValue === "1280x720") {
    GRAPHICS.changeResolution(1280, 720);
  }
  else if (newValue === "1920x1080") {
    GRAPHICS.changeResolution(1920, 1080);
  }
  else if (newValue === "WindowSize") {
    let gameInfoArea = document.getElementById("gameInfoArea");
    GRAPHICS.changeResolution(window.innerWidth, window.innerHeight - gameInfoArea.offsetHeight);
  }
});

/**
 * Adds a listener for the mouse wheel
 */
window.addEventListener("wheel", (event) => {
  event.preventDefault();
  const delta = Math.sign(event.deltaY);
  GRAPHICS.changeLevelZoom(delta);
}, { passive: false });

/**
 * Emit a message to the server to create a new game
 */
function newGame() {
  const name = document.getElementById("name").value;
  socket.emit('newGame', { name: name });
}
document.getElementById('newGameButton').addEventListener('click', newGame);

/**
 * Emit a message to the server to join to a game
 */
function joinGame() {
  const code = document.getElementById('gameCodeInput').value;
  const name = document.getElementById("name").value;
  socket.emit('joinGame', { code: code, name: name });
}
document.getElementById('joinGameButton').addEventListener('click', joinGame);

/**
 * Update the game view according to the game state
 * @param {*} gameState the current game state
 */
function handleGameState(gameState) {
  gameState = JSON.parse(gameState);
  if (!gameActive) {
    return;
  }
  else if (!initialized) {
    initiateGame(gameState);
  }
  else {
    // Send the corresponding messages according to keys pressed
    sendKeysPressed();
    // Update the game according to the game state
    updateGame(playerNumber, gameState);
  }
}

/**
 * Initiates the game
 * @param {*} gameState 
 */
function handleInit (plNumber, code) {
  playerNumber = plNumber;
  gameCode = code;
  document.getElementById("gamecodetext").innerText = "Gamecode: " + gameCode;
  document.getElementById("gameInfoArea").style.display = "block";
  gameActive = true;
  let mainScreen = document.getElementById("mainScreen");
  mainScreen.remove();
}

/**
 * Handle teleportation
 * @param {*} newLevel 
 */
function handleTeleport (newLevel) {
  level = newLevel;
  GRAPHICS.refreshGraphics(level, player, players);
}

/**
 * Emits the corresponding messages to the server according to the 
 * keys pressed
 */
function sendKeysPressed () {
  const keysPressed = KEYBOARD.getKeysPressed();
  for (let i = 0; i < keysPressed.length; i++) {
    let key = keysPressed[i];

    if (key === 87) { // W key
      socket.emit('move', { dir: "Forward", number: playerNumber });
    }
    else if (key === 83) { // S key
      socket.emit('move', { dir: "Back", number: playerNumber });
    }
    else if (key === 65) { // A key
      socket.emit('move', { dir: "Left", number: playerNumber });
    }
    else if (key === 68) { // D key
      socket.emit('move', { dir: "Right", number: playerNumber });
    }
    else if (key === 82) { // R key
      socket.emit('respawn', { number: playerNumber });
    }
  }
}

/**
 * If the player gave an unknown game code
 */
function handleUnknownCode() {
  playerNumber = null;
  alert('Unknown Game Code')
}

/**
 * If the requested game room is full
 */
function handleTooManyPlayers() {
  playerNumber = null;
  alert('The game room is full');
}

