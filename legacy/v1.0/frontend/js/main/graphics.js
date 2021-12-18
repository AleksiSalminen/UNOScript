
function updateLobby(player, players, gameCode) {

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
  for (let i = 0; i < players.length; i++) {
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

function updateGameInfoView(player, players, gameCode, deckSize, discardTop, currentPlayer) {
  if (gameCode) {
    let gameCodeTextElem = document.getElementById("gameCodeText2");
    gameCodeTextElem.innerHTML = "Pelikoodi: " + gameCode;
  }

  let infoTable = document.getElementById("playerInfoTable");
  let infoTableItems = `
    <thead>
      <th scope="col" class="col-4">Nimi</th>
      <th scope="col" class="col-2">Kortteja</th>
    </thead>
  `;

  // Update info table (players' info)
  for (let i = 0; i < players.length; i++) {
    if (players[i].number !== player.number) {
      if (currentPlayer == players[i].number) {
        infoTableItems += `
          <tr class="table-primary">
            <td>` + players[i].name + `</td>
            <td>` + players[i].cards + `</td>
          </tr>
        `;
      }
      else {
        infoTableItems += `
          <tr>
            <td>` + players[i].name + `</td>
            <td>` + players[i].cards + `</td>
          </tr>
        `;
      }
    }
    else {
      if (currentPlayer == players[i].number) {
        infoTableItems += `
          <tr class="table-primary">
            <th scope="row">` + players[i].name + `</th>
            <th scope="row">` + players[i].cards.length + `</th>
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
  }
  infoTable.innerHTML = infoTableItems;

  let deckTextElem = document.getElementById("deckText");
  deckTextElem.innerHTML = "Kortteja pakassa: " + deckSize;

  let discardTopImgElem = document.getElementById("discardTop");
  let discardTopImgLoc = "./images/cards/" + discardTop.color + "/" + discardTop.number + ".png";
  discardTopImgElem.src = discardTopImgLoc;
}

function updateCardsTableView(player) {
  const cards = player.cards;
  const cardsOnCol = Math.ceil(cards.length/10);
  let cardsTable = document.getElementById("cardsTable");
  let cardsTableItems = "";

  for (let row = 0; row < cardsOnCol; row++) {
    cardsTableItems += "<tr>"
    for (let col = 0; col < Math.ceil(cards.length / cardsOnCol); col++) {
      const card = cards[row + col * cardsOnCol];
      if (card) {
        const cardImgLoc = "./images/cards/" + card.color + "/" + card.number + ".png";
        cardsTableItems += `<td>
            <p hidden>` + JSON.stringify(card) + `</p>
            <img src=` + cardImgLoc + ` class="img-fluid">
          </td>
        `;
      }
      else {
        cardsTableItems += `<td></td>`;
      }
    }
    cardsTableItems += "</tr>"
  }
  cardsTable.innerHTML = cardsTableItems;


}

function updateGameView(player, players, gameCode, deckSize, discardTop, currentPlayer) {
  updateGameInfoView(player, players, gameCode, deckSize, discardTop, currentPlayer);
  updateCardsTableView(player);
}

function updateGameEndView(winner, players) {
  let winnerTextElem = document.getElementById("winnerText");
  winnerTextElem.innerHTML = "Voittaja on: " + winner;
}

function updateGraphics(player, players, gameCode, status, deckSize, discardTop, currentPlayer, winner) {
  let gameLobbyElem = document.getElementById("gameLobbyScreen");
  let gameElem = document.getElementById("gameScreen");
  let gameEndElem = document.getElementById("gameEndScreen");

  if (document.getElementById("mainScreen").style.display !== "none") {
    document.getElementById("mainScreen").style.display = "none";
  }

  if (status === "Lobby") {
    gameLobbyElem.style.display = "block";
    gameElem.style.display = "none";
    gameEndElem.style.display = "none";
    updateLobby(player, players, gameCode)
  }
  else if (status === "Playing") {
    gameLobbyElem.style.display = "none";
    gameElem.style.display = "block";
    gameEndElem.style.display = "none";
    updateGameView(player, players, gameCode, deckSize, discardTop, currentPlayer);
  }
  else if (status === "GameEnd") {
    gameLobbyElem.style.display = "none";
    gameElem.style.display = "none";
    gameEndElem.style.display = "block";
    updateGameEndView(winner, players);
  }
}


const GRAPHICS = {
  updateGraphics
};

export {
  GRAPHICS
};
