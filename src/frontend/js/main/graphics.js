

let pixiRoot;
let loader;
let levelLoaded = false;

let pixiWidth = 624;
let pixiHeight = 351;
let tilesVertical = 10;
let tilesHorizontal = 10;
let tileWidth = pixiWidth / tilesHorizontal;
let tileHeight = tileWidth / 2;

let level;
let player;
let players;
let enemies;
let objects;

let playerSprites = [];
let enemySprites = [];
let portalSprites = [];
let tileSprites = [];
let tileSpriteTypes = [];
let wallSprites = [];
let wallSpriteTypes = [];

function initiateGraphics (newLevel, newPlayer, newPlayers) {
  // Initialize the PIXI application
  pixiRoot = new PIXI.Application({
    width: pixiWidth,
    height: pixiHeight,
    backgroundColor: "#000000",
    /* 
    antialias: true,
    transparent: false,
    resolution: 1,
    */
  });

  // add the renderer view element to the DOM
  document.body.appendChild(pixiRoot.view);

  loader = PIXI.Loader.shared;

  level = newLevel;
  player = newPlayer;
  players = newPlayers;

  createSprites();
}

function createSprites () {
  console.log("\n---- Loading level: " + level.meta.name + " ----");

  console.log("Creating sprites...");
  let paths = [];
  for (let i = 0; i < level.tiles.length; i++) {
    let path = level.tiles[i].path;
    paths.push(path);
  }

  loader
    .add(paths)
    .load(() => {
      console.log("Tile textures loaded");
      for (let j = 0; j < level.tiles.length; j++) {
        let tile = level.tiles[j];
        let sprite = new PIXI.Sprite(
          loader.resources[tile.path].texture
        );

        let tileSprite = {
          id: tile.id,
          sprite: sprite
        };
        tileSpriteTypes.push(tileSprite);
      }
      createTileSprites();
    });
}

function createTileSprites () {
  for (let row = 0; row < level.map.length; row++) {
    tileSprites[row] = [];
    for (let column = 0; column < level.map[row].row.length; column++) {
      let tileID = level.map[row].row[column];
      let texture;
      for (let k = 0; k < tileSpriteTypes.length; k++) {
        let tileSprite = tileSpriteTypes[k];
        if (tileSprite.id === tileID) {
          texture = tileSprite.sprite.texture;
          k = tileSpriteTypes.length;
        }
      }
      let sprite = new PIXI.Sprite(texture);
      sprite.x = (column * tileWidth / 2) + (row * tileWidth / 2);
      sprite.y = (row * tileHeight / 2) - (column * tileHeight / 2);
      sprite.width = tileWidth;
      sprite.height = tileHeight;
      let tileSprite = {
        id: tileID,
        sprite: sprite
      };
      tileSprites[row].push(tileSprite);
    }
  }
  console.log("Tile sprites created");
  createWalls();
}

function createWalls () {
  let paths = [];
  for (let i = 0; i < level.walls.length; i++) {
    let path = level.walls[i].path;
    paths.push(path);
  }

  loader
    .add(paths)
    .load(() => {
      console.log("Wall textures loaded");
      for (let j = 0; j < level.walls.length; j++) {
        let wall = level.walls[j];
        let sprite = new PIXI.Sprite(
          loader.resources[wall.path].texture
        );

        let wallSprite = {
          id: wall.id,
          sprite: sprite
        };
        wallSpriteTypes.push(wallSprite);
      }
      createWallSprites();
    });
}

function createWallSprites () {
  for (let row = 0; row < level.wallMap.length; row++) {
    wallSprites[row] = [];
    for (let column = level.wallMap[row].row.length-1; column >= 0; column--) {
      let wallID = level.wallMap[row].row[column];
      let texture;
      let height;
      for (let k = 0; k < wallSpriteTypes.length; k++) {
        let wallSprite = wallSpriteTypes[k];
        if (wallSprite.id === wallID) {
          texture = wallSprite.sprite.texture;
          for (let u = 0; u < level.walls.length; u++) {
            let wall = level.walls[u];
            if (wall.id === wallID) {
              height = wall.height
            }
          }
          k = wallSpriteTypes.length;
        }
      }
      let sprite = new PIXI.Sprite(texture);
      sprite.x = (column * tileWidth / 2) + (row * tileWidth / 2);
      sprite.y = (row * tileHeight / 2) - (column * tileHeight / 2) - (tileHeight * height);
      sprite.width = tileWidth;
      sprite.height = tileHeight * height;
      let wallSprite = {
        id: wallID,
        sprite: sprite
      };
      wallSprites[row].unshift(wallSprite);
    }
  }
  console.log("Wall sprites created");
  createPlayers();
}

function createPlayers () {
  let paths = ["images/characters/hero_stand_sw_0001.png"];

  loader
    .add(paths)
    .load(() => {
      console.log("Player textures loaded");
      let sprite = new PIXI.Sprite(
        loader.resources[paths[0]].texture
      );
      sprite.width = tileWidth / level.meta.tileWidth * player.width;
      sprite.height = tileHeight / level.meta.tileHeight * player.height;
      sprite.x = (pixiWidth / 2) - (sprite.width / 2);
      sprite.y = (pixiHeight / 2) - sprite.height;
      let playerSprite = {
        id: player.number,
        sprite: sprite
      };
      playerSprites.push(playerSprite);
      console.log("Player sprites created");
      createPortals();
    });
}

function createPortals () {
  let paths = [level.portals[0].path];

  loader
    .add(paths)
    .load(() => {
      console.log("Portal textures loaded");
      let sprite = new PIXI.Sprite(
        loader.resources[paths[0]].texture
      );
      
      let portalSprite = {
        id: 1,
        sprite: sprite
      };
      portalSprites.push(portalSprite);
      console.log("Portal sprites created");
      printTexturesLoadedMsg();
    });
}

function printTexturesLoadedMsg () {
  console.log("Textures loaded and sprites created successfully");
  console.log("--------------------------");
  levelLoaded = true;
}

function changeResolution (width, height) {
  pixiRoot.renderer.resize(width, height);
  pixiWidth = width;
  pixiHeight = height;
  tileWidth = pixiWidth / tilesHorizontal;
  tileHeight = tileWidth / 2;
}

function changeLevelZoom (delta) {
  if (delta < 0 && tilesVertical > 1 && tilesHorizontal > 1) {
    tilesVertical = tilesVertical-1;
    tilesHorizontal = tilesHorizontal-1;
    tileWidth = pixiWidth / tilesHorizontal;
    tileHeight = tileWidth / 2;
  }
  else if (delta > 0 && tilesVertical < 50 && tilesHorizontal < 50) {
    tilesVertical = tilesVertical+1;
    tilesHorizontal = tilesHorizontal+1;
    tileWidth = pixiWidth / tilesHorizontal;
    tileHeight = tileWidth / 2;
  }
}

function emptySpriteArrays () {
  playerSprites = [];
  enemySprites = [];
  portalSprites = [];
  tileSprites = [];
  tileSpriteTypes = [];
  wallSprites = [];
  wallSpriteTypes = [];
}

function refreshGraphics (newLevel, newPlayer, newPlayers) {
  levelLoaded = false;
  emptySpriteArrays();
  loader.reset();
  PIXI.utils.clearTextureCache();
  level = newLevel;
  player = newPlayer;
  players = newPlayers;
  createSprites();
}

function drawLevel (newPlayer, newPlayers) {
  player = newPlayer;
  players = newPlayers;

  if (!levelLoaded) {
    return;
  }
  // Clear PIXI stage
  for (var i = pixiRoot.stage.children.length - 1; i >= 0; i--) {	pixiRoot.stage.removeChild(pixiRoot.stage.children[i]);};

  const playerWidth = tileWidth / level.meta.tileWidth * player.width;
  const playerHeight = tileHeight / level.meta.tileHeight * player.height;
  const playerX = (pixiWidth / 2) - (playerWidth / 2);
  const playerY = (pixiHeight / 2) - playerHeight;

  const centerX = pixiWidth/2;
  const centerY = pixiHeight/2 - tileHeight/2;
  const playerTileCol = Math.floor(player.pos.x / level.meta.tileWidth);
  const playerTileRow = Math.floor(player.pos.y / level.meta.tileHeight);
  const xHypotenuseO = player.pos.x - playerTileCol * level.meta.tileWidth;
  const yHypotenuseO = player.pos.y - playerTileRow * level.meta.tileHeight;
  const levelTileCenterX = (level.meta.tileWidth * Math.sqrt(2)) / 2;
  const levelTileCenterY = (level.meta.tileHeight * Math.sqrt(2)) / 2;
  const xHypotenuse = xHypotenuseO / levelTileCenterX * tileWidth/2;
  const yHypotenuse = yHypotenuseO / levelTileCenterY * tileHeight;
  const xa = (2 * xHypotenuse * Math.sqrt(5)) / 5;
  const ya = (2 * yHypotenuse * Math.sqrt(5)) / 5;
  const px = xa + ya;
  const py = (xa/2) - (ya/2);

  // Update tile sprites
  for (let row = 0; row < tileSprites.length; row++) {
    for (let column = 0; column < tileSprites[row].length; column++) {
      let tileSprite = tileSprites[row][column].sprite;
      const tileArrayX = ((playerTileCol - column) * tileWidth / 2) + ((playerTileRow - row) * tileWidth / 2);
      const tileArrayY = ((playerTileRow - row) * tileHeight / 2) - ((playerTileCol - column) * tileHeight / 2);
      tileSprite.x = centerX - tileArrayX - px;
      tileSprite.y = centerY - tileArrayY + py;
      tileSprite.width = tileWidth;
      tileSprite.height = tileHeight;
      if (!(tileSprite.x < 0 - tileWidth || tileSprite.x > pixiWidth || tileSprite.y < 0 - tileHeight || tileSprite.y > pixiHeight)) {
        pixiRoot.stage.addChild(tileSprite);
      }
      tileSprites[row][column].sprite = tileSprite;
    }
  }

  let playerUpdated = false;
  let portalUpdated = false;

  // Update wall sprites, portal sprites and player sprites
  for (let row = 0; row < wallSprites.length; row++) {
    for (let column = wallSprites[row].length-1; column >= 0; column--) {
      let wallSprite = wallSprites[row][column].sprite;
      const wallArrayX = ((playerTileCol - column) * tileWidth / 2) + ((playerTileRow - row) * tileWidth / 2);
      const wallArrayY = ((playerTileRow - row) * tileHeight / 2) - ((playerTileCol - column) * tileHeight / 2);
      let height;
      for (let i = 0; i < level.walls.length; i++) {
        let wall = level.walls[i];
        if (wall.id === wallSprites[row][column].id) {
          height = wall.height;
        }
      }
      wallSprite.x = centerX - wallArrayX - px;
      wallSprite.y = centerY - wallArrayY + py - (tileHeight * (height-1));
      wallSprite.width = tileWidth;
      wallSprite.height = tileHeight * height;
      // Update player if wall in front of player
      if (!playerUpdated && row === playerTileRow && column < playerTileCol) {
        updatePlayerSprites();
        playerUpdated = true;
      }
      // Update portal if wall in front of portal
      let portal = level.portals[0];
      if (!portalUpdated && row === portal.loc.row && column < portal.loc.col) {
        updatePortalSprites(portal);
        portalUpdated = true;
      }
      // Set transparency if wall below player
      /*if ((wallSprite.y + wallSprite.height) > (playerY + playerHeight) && (wallSprite.y + wallSprite.height) < (playerY + playerHeight + (5*tileHeight))) {
        wallSprite.alpha = 0.7;
      }
      else {
        wallSprite.alpha = 1;
      }*/
      // Show wall if inside the game view
      if (!(wallSprite.x < 0 - tileWidth || wallSprite.x > pixiWidth || wallSprite.y < 0 - (tileHeight * height) || wallSprite.y > pixiHeight)) {
        pixiRoot.stage.addChild(wallSprite);
      }
      wallSprites[row][column].sprite = wallSprite;
    }
  }

  // If portals were not updated
  if (!portalUpdated) {
    updatePortalSprites(level.portals[0]);
    portalUpdated = true;
  }

  // If the player was not updated
  if (!playerUpdated) {
    updatePlayerSprites();
    playerUpdated = true;
  }

  // Update portal sprites
  function updatePortalSprites (portal) {
    if (portalSprites[0] !== undefined) {
      let portalSprite = portalSprites[0].sprite;
      let row = portal.loc.row;
      let col = portal.loc.col;
      let height = portal.height;
      
      const portalTileX = ((playerTileCol - col) * tileWidth / 2) + ((playerTileRow - row) * tileWidth / 2);
      const portalTileY = ((playerTileRow - row) * tileHeight / 2) - ((playerTileCol - col) * tileHeight / 2);
      portalSprite.x = centerX - portalTileX - px;
      portalSprite.y = centerY - portalTileY + py - (tileHeight * (height-1));
      portalSprite.width = tileWidth;
      portalSprite.height = tileHeight * height;
      pixiRoot.stage.addChild(portalSprite);
      portalSprites[0].sprite = portalSprite;
    }
  }

  // Update player sprites
  function updatePlayerSprites () {
    if (playerSprites[0] !== undefined) {
      let playerSprite = playerSprites[0].sprite;
      playerSprite.width = playerWidth;
      playerSprite.height = playerHeight;
      playerSprite.x = playerX;
      playerSprite.y = playerY;
      pixiRoot.stage.addChild(playerSprite);
      playerSprites[0].sprite = playerSprite;
    }
  }

  updateOtherPlayersSprites();

  // Update other players' sprites
  function updateOtherPlayersSprites () {
    for (let i = 0; i < players.length; i++) {
      let oPlayer = players[i];
      if (oPlayer.number !== player.number && oPlayer.level.meta.id === player.level.meta.id && playerSprites[0] !== undefined) {
        let oPlayerSprite;
        let sIndex;
        for (let j = 0; j < playerSprites.length; j++) {
          let id = playerSprites[j].id;
          if (id === oPlayer.number) {
            oPlayerSprite = playerSprites[j].sprite;
            sIndex = j;
          }
        }

        if (oPlayerSprite === undefined) {
          oPlayerSprite = new PIXI.Sprite(
            loader.resources["images/characters/hero_stand_sw_0001.png"].texture
          );
          playerSprites.push(oPlayerSprite);
          sIndex = playerSprites.length-1;
        }
        oPlayerSprite.width = playerWidth;
        oPlayerSprite.height = playerHeight;
        const playerPosX = player.pos.x / level.meta.tileWidth * tileWidth;
        const playerPosY = player.pos.y / level.meta.tileWidth * tileWidth;
        const oPlayerPosX = oPlayer.pos.x / level.meta.tileWidth * tileWidth;
        const oPlayerPosY = oPlayer.pos.y / level.meta.tileWidth * tileWidth;
        const hypotenuseX = playerPosX - oPlayerPosX;
        const hypotenuseY = playerPosY - oPlayerPosY;
        const xha = (2 * hypotenuseX * Math.sqrt(5)) / 5;
        const yha = (2 * hypotenuseY * Math.sqrt(5)) / 5;
        const opx = xha + yha;
        const opy = (xha/2) - (yha/2);
        oPlayerSprite.x = centerX - opx/2 - playerWidth/2;
        oPlayerSprite.y = centerY + opy/2 - playerHeight/2;
        pixiRoot.stage.addChild(oPlayerSprite);
        playerSprites[sIndex].sprite = oPlayerSprite;
      }
    }
  }

}


const GRAPHICS = {
  initiateGraphics,
  changeResolution,
  changeLevelZoom,
  refreshGraphics,
  drawLevel
};

export {
  GRAPHICS
};
