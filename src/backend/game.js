const { io } = require('./handler');
const RULES = require('./rules');
const DECK = RULES.DECK;
const COLORS = RULES.COLORS;
const state = {};
const clientRooms = {};
const FRAME_RATE = 5;
const numOfStartCards = 7;
const maxNumberOfPlayers = 10;


module.exports = {

  /**
   * 
   */
  createNewGame(client, params) {
    let roomName = makeid(5);
    clientRooms[client.id] = roomName;

    state[roomName] = initGame(client.id, params.name);

    client.join(roomName);
    client.number = 1;
    client.emit("init", client.number, roomName);

    startGameInterval(roomName);
  },

  /**
   * 
   * @param {*} roomName 
   */
  joinGame(client, params) {
    const roomName = params.code
    const room = io.sockets.adapter.rooms[roomName];

    let allUsers;
    if (room) {
      allUsers = room.sockets;
    }

    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      client.emit("unknownCode");
      return;
    } else if (numClients > maxNumberOfPlayers - 1) {
      client.emit("tooManyPlayers");
      return;
    } else if (state[roomName].status === "Playing") {
      client.emit("gameHasStarted");
      return
    }

    clientRooms[client.id] = roomName;

    client.join(roomName);
    client.number = numClients + 1;
    client.emit("init", numClients + 1, roomName);

    const playerAmount = state[roomName].players.length;
    state[roomName].players.push({
      client: client.id,
      number: state[roomName].players[playerAmount - 1].number + 1,
      name: params.name,
      cards: []
    });
  },

  /**
   * 
   */
  startGame (client, params) {
    const roomName = clientRooms[client.id];
    state[roomName].status = "Playing";
    divideCards(state[roomName]);
  },

  /**
   * 
   * @param {*} client 
   * @param {*} params 
   */
  removeClient(client, params) {
    const roomName = clientRooms[client.id];
    if (!roomName) {
      return;
    }

    for (let i = 0; i < state[roomName].players.length; i++) {
      let player = state[roomName].players[i];
      if (player.client === client.id) {
        state[roomName].players.splice(i, 1);
        i = state[roomName].players.length;
      }
    }
  },
};


function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function divideCards (state) {
  let deck = state.deck;
  // Go through the rounds of dividing the cards
  for (let round = 1;round <= numOfStartCards;round++) {
    // Give one card to each player
    for (let plI = 0;plI < state.players.length;plI++) {
      let player = state.players[plI];
      player.cards.push(deck.pop());
    }
  }
}

function shuffleDeck(deck) {
  let shuffledDeck = [];
  let chosenCardIndex = -1;

  while (deck.length > 0) {
    chosenCardIndex = Math.floor(Math.random() * (deck.length-1));
    shuffledDeck.push(deck[chosenCardIndex]);
    deck.splice(chosenCardIndex, 1);
  }

  return shuffledDeck;
}

function censorGamestate (plNumber, gameState) {
  let censoredState = {
    status: gameState.status,
    deckSize: gameState.deck.length,
    players: []
  };

  let players = gameState.players;
  for (let plI = 0;plI < players.length;plI++) {
    let player = players[plI];
    if (player.number === plNumber) {
      censoredState.players.push({
        number: player.number,
        name: player.name,
        cards: player.cards
      });
    }
    else {
      censoredState.players.push({
        number: player.number,
        name: player.name,
        cards: player.cards.length
      });
    }
  }

  return censoredState;
}

function initGame(clientID, playerName) {
  const gameDeck = JSON.parse(JSON.stringify(DECK));
  const shuffledDeck = shuffleDeck(gameDeck);
  
  return {
    status: "Lobby",
    deck: shuffledDeck,
    discardPile: [],
    currentPlayer: 1,
    players: [
      {
        client: clientID,
        number: 1,
        name: playerName,
        cards: []
      }
    ]
  };
}

function gameLoop(roomName) {
  if (!state[roomName]) {
    return;
  }

  // Update players
  for (h = 0; h < state[roomName].players.length; h++) {
    let player = state[roomName].players[h];

  }
}

/**
 * Main game loop
 * @param {*} roomName 
 */
function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    gameLoop(roomName);
    emitGameState(roomName, state[roomName]);
  }, 1000 / FRAME_RATE);
}

function emitGameState(roomName, gameState) {
  let players = gameState.players;
  for (let plI = 0;plI < players.length;plI++) {
    let player = players[plI];
    const censoredState = censorGamestate(player.number, gameState);
    io.to(player.client).emit("gameState", JSON.stringify(censoredState));
  }
}

