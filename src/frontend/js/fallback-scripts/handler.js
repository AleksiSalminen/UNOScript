
/* ---------------------------------------- */
/* Stuff for socket connection and messages */
/* ---------------------------------------- */


/* Establish socket connection with the server backend */
const socket = io(serverAddress);

/* Set the socket message listeners */
socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("teleport", handleTeleport);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);

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
    changeResolution(624, 351);
  }
  else if (newValue === "1280x720") {
    changeResolution(1280, 720);
  }
  else if (newValue === "1920x1080") {
    changeResolution(1920, 1080);
  }
  else if (newValue === "WindowSize") {
    let gameInfoArea = document.getElementById("gameInfoArea");
    changeResolution(window.innerWidth, window.innerHeight - gameInfoArea.offsetHeight);
  }
});

/**
 * Adds a listener for the mouse wheel
 */
window.addEventListener("wheel", (event) => {
  event.preventDefault();
  const delta = Math.sign(event.deltaY);
  changeLevelZoom(delta);
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
  refreshGraphics();
}

/**
 * Emits the corresponding messages to the server according to the 
 * keys pressed
 */
function sendKeysPressed () {
  for (i = 0; i < keysPressed.length; i++) {
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
    else if (key === 37) { // Left arrow key
      socket.emit('move', { dir: "RotLeft", number: playerNumber });
    }
    else if (key === 39) { // Right arrow key
      socket.emit('move', { dir: "RotRight", number: playerNumber });
    }
    else if (key === 32) { // Spacebar key
      socket.emit('shoot', { number: playerNumber });
    }
    else if (key === 82) { // R key
      socket.emit('respawn', { number: playerNumber });
      scene.add(meshes["playerweapon"]);
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

