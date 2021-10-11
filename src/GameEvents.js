import { updateGame } from './firebase';

import { getRandomIntIncl } from './utils/common';
import { tileValsAll, generateDice, getWinnerIndex } from './utils/GameUtils';

export function rollDice(gameId, gameData, saveAreaDims, rollAreaDims) {
  const diceSize = saveAreaDims.height / 1.2;
  const dice = generateDice(gameData.nDiceLeft, diceSize, rollAreaDims);
  updateGame(gameId, {
    ...gameData,
    diceRolled: dice,
    justRolledDice: true,
    justPickedDice: false
  });
}

export function stopRolling(gameId, gameData, canPickTile) {
  if (canPickTile) {
    alert('You have to pick a tile...');
  } else if (gameData.players[gameData.currPlayerIndex].tiles.length > 0) {
    handBackTile(gameId, gameData);
  } else {
    updateGame(gameId, {
      ...gameData,
      diceRolled: [],
      diceSavedVals: [],
      currPlayerIndex: (gameData.currPlayerIndex + 1) % gameData.players.length,
      justRolledDice: false,
      justPickedDice: false
    });
  }
}

function handBackTile(gameId, gameData) {
  const tileValue = [...gameData.players[gameData.currPlayerIndex].tiles].pop();
  const updatedTilesTable = 
    tileValue > Math.max(...gameData.tilesTable) ? (
      [...gameData.tilesTable, tileValue].sort()
    ) : (
      [...gameData.tilesTable.slice(0, -1), tileValue].sort()
    );
  const updatedPlayers = gameData.players.map((player, index) =>
    index === gameData.currPlayerIndex ? (
      {
        ...player,
        tiles: [...player.tiles.slice(0,-1)]
      }
    ) : (
      player
    )
  );
  updateGame(gameId, {
    ...gameData,
    tilesTable: updatedTilesTable,
    players: updatedPlayers,
    diceRolled: [],
    diceSavedVals: [],
    currPlayerIndex: (gameData.currPlayerIndex + 1) % gameData.players.length,
    justRolledDice: false,
    justPickedDice: false
  });
}

export function handleDiceClick(gameId, gameData, clickedValue) {
  const diceLeft = gameData.diceRolled.filter(dice =>
    dice.value !== clickedValue);
  const dicePicked = gameData.diceRolled.filter(dice =>
    dice.value === clickedValue);
  const updatedDiceSavedVals =
    [...gameData.diceSavedVals, ...dicePicked.map(dice => dice.value)];
  updateGame(gameId, {
    ...gameData,
    diceRolled: diceLeft,
    diceSavedVals: updatedDiceSavedVals,
    justRolledDice: false,
    justPickedDice: true
  });
}

export function handleTableTileClick(gameId, gameData, clickedValue) {
  const tilesLeft = gameData.tilesTable.filter(value => value !== clickedValue);
  const updatedPlayers = gameData.players.map((player, index) =>
    index === gameData.currPlayerIndex ? (
      {
        ...player,
        tiles: [...player.tiles, clickedValue]
      }
    ) : (
      player
    )
  );
  const gameFinished = (tilesLeft.length === 0);
  updateGame(gameId, {
    ...gameData,
    status: gameFinished ? 'finished' : 'ingame',
    players: updatedPlayers,
    currPlayerIndex: (gameData.currPlayerIndex + 1) % gameData.players.length,
    winnerIndex: gameFinished ? getWinnerIndex(updatedPlayers) : -1,
    diceRolled: [],
    diceSavedVals: [],
    tilesTable: tilesLeft,
    justRolledDice: gameFinished,
    justPickedDice: !gameFinished
  });
}

export function handleTileSteal(gameId, gameData, clickedValue) {
  const victimIndex = gameData.stealableTiles.findIndex(val => val === clickedValue);
  const updatedPlayers = gameData.players.map((player, index) => {
    if (index === gameData.currPlayerIndex) {
      return {
        ...player,
        tiles: [...player.tiles, clickedValue]
      };
    } else if (index === victimIndex) {
      return {
        ...player,
        tiles: [...player.tiles.slice(0,-1)]
      };
    } else {
      return player;
    }
  });
  updateGame(gameId, {
    ...gameData,
    players: updatedPlayers,
    diceRolled: [],
    diceSavedVals: [],
    currPlayerIndex: (gameData.currPlayerIndex + 1) % gameData.players.length
  });
}

export function resetGame(gameId, gameData) {
  updateGame(gameId, {
    ...gameData,
    status: 'ingame',
    players: gameData.players.map(player => {
      return {
        ...player,
        tiles: []
      };
    }),
    currPlayerIndex: getRandomIntIncl(0, gameData.players.length - 1),
    winnerIndex: -1,
    diceRolled: [],
    diceSavedVals: [],
    tilesTable: tileValsAll,
    justRolledDice: false,
    justPickedDice: true
  });
}
