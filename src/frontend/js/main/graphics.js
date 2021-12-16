
function updateLobby (player, players, gameCode) {

  if (gameCode) {
    let gameCodeTextElem = document.getElementById("gameCodeText");
    gameCodeTextElem.innerHTML = "Pelikoodi: " + gameCode;
  }

  let playersAmountTextElem = document.getElementById("playersAmountText");
  playersAmountTextElem.innerHTML = "Pelaajia: " + players.length + "/10"

  let infoTable = document.getElementById("gameInfoTable");
  let infoTableItems = `
    <thead>
      <th scope="col">Nimi</th>
    </thead>
  `;

  // Update info table (players' info)
  for (let i = 0;i < players.length;i++) {
    if (players[i].number !== player.number) {
      infoTableItems += `
        <tr>
          <td>` + players[i].name + `</td>
        </tr>
      `;
    }
    else {
      infoTableItems += `
        <tr>
          <th scope="row">` + players[i].name + `</th>
        </tr>
      `;
    }
  }
  infoTable.innerHTML = infoTableItems;

  let warningText = document.getElementById("playersNumWarningText");
  let startButton = document.getElementById("startGameButton");
  if (players.length >= 2) {
    warningText.style.display = "none";
    startButton.className = "btn btn-primary";
    startButton.disabled = false;
  }
  else {
    warningText.style.display = "block";
    startButton.className = "btn btn-outline-primary";
    startButton.disabled = true;
  }
}

function updateGameInfoView (player, players, gameCode, deckSize) {
  if (gameCode) {
    let gameCodeTextElem = document.getElementById("gameCodeText2");
    gameCodeTextElem.innerHTML = "Pelikoodi: " + gameCode;
  }

  let infoTable = document.getElementById("playerInfoTable");
  let infoTableItems = `
    <thead>
      <th scope="col">Nimi</th>
      <th scope="col">Kortteja</th>
    </thead>
  `;

  // Update info table (players' info)
  for (let i = 0;i < players.length;i++) {
    if (players[i].number !== player.number) {
      infoTableItems += `
        <tr>
          <td>` + players[i].name + `</td>
          <td>` + players[i].cards + `</td>
        </tr>
      `;
    }
    else {
      infoTableItems += `
        <tr>
          <th scope="row">` + players[i].name + `</th>
          <th scope="row">` + players[i].cards.length + `</th>
        </tr>
      `;
    }
  }
  infoTable.innerHTML = infoTableItems;

  let deckTextElem = document.getElementById("deckText");
  deckTextElem.innerHTML = "Kortteja pakassa: " + deckSize;
}

function updateGameView (player, players, gameCode, deckSize) {
  updateGameInfoView(player, players, gameCode, deckSize);
}

function updateGraphics (player, players, gameCode, status, deckSize) {
  let gameLobbyElem = document.getElementById("gameLobbyScreen");
  let gameElem = document.getElementById("gameScreen");

  if (status === "Lobby") {
    gameLobbyElem.style.display = "block";
    gameElem.style.display = "none";
    updateLobby(player, players, gameCode)
  } 
  else if (status === "Playing") {
    gameLobbyElem.style.display = "none";
    gameElem.style.display = "block";
    updateGameView(player, players, gameCode, deckSize);
  }
}


const GRAPHICS = {
  updateGraphics
};

export {
  GRAPHICS
};
