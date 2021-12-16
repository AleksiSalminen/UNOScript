
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

function updateGameView (player, players, gameCode) {

}

function updateGraphics (player, players, gameCode, status) {
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
    updateGameView(player, players, gameCode);
  }
}


const GRAPHICS = {
  updateGraphics
};

export {
  GRAPHICS
};
