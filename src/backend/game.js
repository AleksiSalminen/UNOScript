const { io } = require('./handler');
const { world } = require('./objects/world');
const state = {};
const clientRooms = {};
const FRAME_RATE = 30;

let playerHealth = 100;
let playerHeight = 80;
let playerWidth = 30;
let playerSpeed = 3;
let playerGotHit = false;
let playerCurrentLevel = world[0];

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
    }

    clientRooms[client.id] = roomName;

    client.join(roomName);
    client.number = numClients + 1;
    client.emit("init", numClients + 1, roomName);
    
    const level = playerCurrentLevel;
    const playerSpawn = {
      x: level.meta.playerSpawn.col * level.meta.tileWidth,
      y: level.meta.playerSpawn.row * level.meta.tileHeight
    };
    const playerAmount = state[roomName].players.length;
    state[roomName].players.push({
      client: client.id,
      level: level,
      number: state[roomName].players[playerAmount-1].number + 1,
      name: params.name,
      health: playerHealth,
      height: playerHeight,
      width: playerWidth,
      gotHit: playerGotHit,
      pos: playerSpawn
    });
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

    for (let i = 0;i < state[roomName].players.length;i++) {
      let player = state[roomName].players[i];
      if (player.client === client.id) {
        state[roomName].players.splice(i, 1);
        i = state[roomName].players.length;
      }
    }
  },

  /**
   * 
   * @param {*} client 
   * @param {*} params 
   */
  respawnPlayer(client, params) {
    const roomName = clientRooms[client.id];
    if (!roomName) {
      return;
    }
    
    let playerNumber = params.number;
    for (let i = 0;i < state[roomName].players.length;i++) {
      let player = state[roomName].players[i];
      if (player.number === playerNumber && player.health <= 0) {
        
      }
    }
  },

  /**
   * 
   * @param {*} params 
   */
  movePlayer(client, params) {
    const roomName = clientRooms[client.id];
    if (!roomName) {
      return;
    }
    
    let stateCurrent = state[roomName];
    for (let i = 0; i < stateCurrent.players.length; i++) {
      let character = stateCurrent.players[i];
      if (character.number === params.number) {
        if (character.health <= 0) {
          return;
        }

        let newPlayerPos = {
          x: character.pos.x,
          y: character.pos.y
        }

        if (params.dir === "Forward") {
          newPlayerPos.x = character.pos.x + playerSpeed;
          newPlayerPos.y = character.pos.y - playerSpeed;
          if (checkTileCollision(newPlayerPos, character.level) || checkWallCollision(newPlayerPos, character.level)) {
            newPlayerPos.x = character.pos.x;
            newPlayerPos.y = character.pos.y;
          }
        }
        else if (params.dir === "Back") {
          newPlayerPos.x = character.pos.x - playerSpeed;
          newPlayerPos.y = character.pos.y + playerSpeed;
          if (checkTileCollision(newPlayerPos, character.level) || checkWallCollision(newPlayerPos, character.level)) {
            newPlayerPos.x = character.pos.x;
            newPlayerPos.y = character.pos.y;
          }
        }
        else if (params.dir === "Left") {
          newPlayerPos.x = character.pos.x - playerSpeed;
          newPlayerPos.y = character.pos.y - playerSpeed;
          if (checkTileCollision(newPlayerPos, character.level) || checkWallCollision(newPlayerPos, character.level)) {
            newPlayerPos.x = character.pos.x;
            newPlayerPos.y = character.pos.y;
          }
        }
        else if (params.dir === "Right") {
          newPlayerPos.x = character.pos.x + playerSpeed;
          newPlayerPos.y = character.pos.y + playerSpeed;
          if (checkTileCollision(newPlayerPos, character.level) || checkWallCollision(newPlayerPos, character.level)) {
            newPlayerPos.x = character.pos.x;
            newPlayerPos.y = character.pos.y;
          }
        }

        state[roomName].players[i].pos = newPlayerPos;
        i = stateCurrent.players.length;

        let portalHit = checkPortalCollision(newPlayerPos, character.level);
        if (portalHit) {
          teleportPlayer(client, portalHit, character);
        }
      }
    }
  },
};

function checkTileCollision (location, level) {
  const px = location.x;
  const py = location.y;
  const tileHeight = level.meta.tileHeight;
  const tileWidth = level.meta.tileWidth;

  const playerTileX = Math.floor(px / tileWidth);
  const playerTileY = Math.floor(py / tileHeight);
  
  // Check for out-of-bounds coordinates
  if (px < 0 || py < 0 || px > level.map[0].row.length*tileWidth || py > level.map.length*tileHeight) {
    return true;
  }
  // Check for undefined values
  else if (level.map[playerTileY] === undefined || level.map[playerTileY].row[playerTileX] === undefined) {
    return true;
  }
  // Check for empty tile coordinates
  else if (level.map[playerTileY].row[playerTileX] === 0) {
    return true;
  }
  // No collisions
  else {
    return false;
  }
}

function checkWallCollision (location, level) {
  const px = location.x;
  const py = location.y;
  const tileHeight = level.meta.tileHeight;
  const tileWidth = level.meta.tileWidth;

  const playerTileX = Math.floor(px / tileWidth);
  const playerTileY = Math.floor(py / tileHeight);
  
  // If no walls on a level
  if (level.wallMap.length === 0) {
    return false;
  }
  // Check for undefined values
  else if (level.wallMap[playerTileY] === undefined || level.wallMap[playerTileY].row[playerTileX] === undefined) {
    return true;
  }
  // Check for wall collision
  else if (level.wallMap[playerTileY].row[playerTileX] !== 0) {
    const wallID = level.wallMap[playerTileY].row[playerTileX];
    let wall;
    for (let i = 0; i < level.walls.length; i++) {
      if (wallID === level.walls[i].id) {
        wall = level.walls[i];
        i = level.walls.length
      }
    }
    if (wall.passable) {
      return false;
    }
    else {
      return true;
    }
  }
  // No collisions
  else {
    return false;
  }
}

function checkPortalCollision (location, level) {
  const px = location.x;
  const py = location.y;
  const tileHeight = level.meta.tileHeight;
  const tileWidth = level.meta.tileWidth;

  const playerTileX = Math.floor(px / tileWidth);
  const playerTileY = Math.floor(py / tileHeight);
  
  const portals = level.portals;
  for (let i = 0; i < portals.length; i++) {
    const portal = portals[i];
    if (portal.loc.row === playerTileY && portal.loc.col === playerTileX) {
      return portal;
    }
  }

  return null;
}

function findLevel (id) {
  for (let i = 0; i < world.length; i++) {
    let level = world[i];
    if (level.meta.id === id) {
      return level;
    }
  }
  return null;
}

function teleportPlayer (client, portal, player) {
  const newLevel = findLevel(portal.dest);
  player.level = newLevel;
  player.pos = {
    x: player.level.meta.playerSpawn.col * player.level.meta.tileWidth,
    y: player.level.meta.playerSpawn.row * player.level.meta.tileHeight
  };
  client.emit("teleport", newLevel);
}

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

function initGame(clientID, playerName) {
  const level = playerCurrentLevel;
  const playerSpawn = {
    x: level.meta.playerSpawn.col * level.meta.tileWidth,
    y: level.meta.playerSpawn.row * level.meta.tileHeight
  };

  return {
    players: [
      {
        client: clientID,
        level: level,
        number: 1,
        name: playerName,
        health: playerHealth,
        height: playerHeight,
        width: playerWidth,
        gotHit: playerGotHit,
        pos: playerSpawn
      }
    ]
  };
}

function gameLoop(roomName) {
  if (!state[roomName]) {
    return;
  }

  // Update players
  for (h = 0;h < state[roomName].players.length;h++) {
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

function emitGameState(room, gameState) {
  // Send this event to everyone in the room.
  io.sockets.in(room).emit("gameState", JSON.stringify(gameState));
}

