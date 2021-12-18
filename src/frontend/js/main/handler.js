
import { GRAPHICS } from './graphics.js'
import { KEYBOARD } from './keyboard.js'; 

const serverAddress = "http://localhost:3000";

let player;
let playerNumber;
let players;
let gameCode;
let status = "";
let winner;
let deckSize = 0;
let playedCard = {};
let discardTop;
let currentPlayer;
let playersMaxNum = 10;

/* Establish socket connection with the server backend */
const socket = io(serverAddress);

/* Set the socket message listeners */
socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('gameHasStarted', handleGameHasStarted);

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

function getImageValue (cell) {
  let card = {};

  let startPos = cell.search('<p hidden="">') + 13;

  let cardStr = "";
  for (let i = startPos;i < cell.length;i++) {
    cardStr += cell[i];
    if (cell[i] === '}') {
      i = cell.length;
    }
  }
  console.log(cardStr);
  // Remove possible line breaks
  cardStr = cardStr.replace(/(\r\n|\n|\r)/gm, "");
  // Remove possible spaces
  cardStr = cardStr.replace(/\s/g, '');

  card = JSON.parse(cardStr);
  return card;
}

function chooseCard (cell) {
  if (cell.innerHTML.length > 0) {
    const card = getImageValue(cell.innerHTML);
    playedCard = card;
    if (card.color !== "Black") {
      socket.emit('addCard', JSON.stringify(card));
    }
    else {
      $("#colorModal").modal("show");
    }
  }
}

$('#colorModal').on('hidden.bs.modal', function (e) {
  // Get the chosen radio value
  const color = $('input[name=color]:checked').val();
  if (color) {
    playedCard.color = color;
    socket.emit('addCard', JSON.stringify(playedCard));
  }
})

function closeModal () {
  $('#colorModal').modal('hide');
}
document.getElementById("saveModalButton").addEventListener('click', closeModal)
document.getElementById("closeModalButton").addEventListener('click', closeModal)

function drawCard () {
  socket.emit('drawCard', {});
}
document.getElementById('drawCardButton').addEventListener('click', drawCard);

function callUno () {
  socket.emit('callUno', {});
}
document.getElementById('unoButton').addEventListener('click', callUno);

function updateCardsListeners () {
  let cardsTable = document.getElementById("cardsTable");
  // Add click listeners to the new table cells
  for (let i = 0; i < cardsTable.rows.length; i++) {
    for (let j = 0; j < cardsTable.rows[i].cells.length; j++) {
      cardsTable.rows[i].cells[j].onclick = function () {
        chooseCard(this);
      };
    }
  }
}

/**
* Updates the game
* @param {*} playerNumber 
* @param {*} gameState 
*/
function updateGame(playerNumber, gameState) {
  console.log(gameState);
  status = gameState.status;
  deckSize = gameState.deckSize;
  discardTop = gameState.discardTop;
  players = gameState.players;
  currentPlayer = gameState.currentPlayer;
  winner = gameState.winner;
  playersMaxNum = gameState.playersMaxNum;
  player = findPlayer(playerNumber, players);
  GRAPHICS.updateGraphics(player, players, gameCode, status, deckSize, discardTop, currentPlayer, winner, playersMaxNum);
  updateCardsListeners();
}

/**
 * Emit a message to the server to create a new game
 */
function newGame() {
  const name = document.getElementById("name").value;
  const startCardsNum = document.getElementById("startCardsQuantity").value;
  const playersMaxNum = document.getElementById("playersMaxQuantity").value;
  socket.emit('newGame', { 
    name: name,
    startCardsNum: startCardsNum,
    playersMaxNum: playersMaxNum
  });
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
 * Emit a message to the server to start the game
 */
function startGame() {
  socket.emit('startGame', {});
}
document.getElementById('startGameButton').addEventListener('click', startGame);

/**
 * Update the game according to the game state
 * @param {*} gameState the current game state
 */
function handleGameState(gameState) {
  gameState = JSON.parse(gameState);
  // Send the corresponding messages according to keys pressed
  sendKeysPressed();
  // Update the game according to the game state
  updateGame(playerNumber, gameState);
}

/**
 * 
 * @param {*} plNumber 
 * @param {*} code 
 */
function handleInit (plNumber, code) {
  playerNumber = plNumber;
  gameCode = code;
}

/**
 * Emits the corresponding messages to the server according to the 
 * keys pressed
 */
function sendKeysPressed () {
  const keysPressed = KEYBOARD.getKeysPressed();
  for (let i = 0; i < keysPressed.length; i++) {
    let key = keysPressed[i];

    // Just an example for now
    if (key === 87) { // W key
      //socket.emit('move', { number: playerNumber });
    }
  }
}

/**
 * If the player gave an unknown game code
 */
function handleUnknownCode() {
  playerNumber = null;
  alert('Tuntematon pelikoodi')
}

/**
 * If the requested game room is full
 */
function handleTooManyPlayers() {
  playerNumber = null;
  alert('Pelihuone on täynnä');
}

/**
 * 
 */
function handleGameHasStarted() {
  playerNumber = null;
  alert('Peli on jo alkanut');
}

