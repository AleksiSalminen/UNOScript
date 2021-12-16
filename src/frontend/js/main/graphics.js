

function updateGraphics (player, players) {
  let gameInfoElem = document.getElementById("gameInfoScreen");
  let infoGrid = document.getElementById("infoGridGontainer");
  
  // Update info grid (other players' info)
  let infoGridItems = "";
  for (let i = 0;i < players.length;i++) {
    if (players[i].number !== player.number) {
      infoGridItems += "<div><p>" + players[i].name + "</p></div>"
    }
  }
  infoGrid.innerHTML = infoGridItems;
}


const GRAPHICS = {
  updateGraphics
};

export {
  GRAPHICS
};
