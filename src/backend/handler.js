const { io } = require("../uno");
module.exports = { io };

const { 
  createNewGame,
  joinGame,
  removeClient
} = require("./game");


/* When connection is established */
io.on("connection", (client) => {

  client.on("newGame", handleNewGame);
  function handleNewGame(params) { createNewGame(client, params); }

  client.on("joinGame", handleJoinGame);
  function handleJoinGame(params) { joinGame(client, params); }

  client.on("disconnect", handleDisconnect);
  function handleDisconnect(params) { removeClient(client, params); }
  
});

