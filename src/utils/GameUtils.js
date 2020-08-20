import { getRandomIntIncl, checkCircleCollision } from './common';

const nTiles = 16;
const minTileVal = 21;

export const tileValsAll = [...Array(nTiles).keys()].map(i => i + minTileVal);

export function getWormValue(tileValue) {
  return Math.floor((tileValue - minTileVal) / 4) + 1
}

export function getWormScore(tileVals) {
  return tileVals.reduce( (acc, curr) => acc + getWormValue(curr), 0);
}

export function generateDice(nDice, diceSize, rollAreaDims) {
  const dice = [];
  const minDistance = diceSize * Math.sqrt(2);

  let rnd;
  let pos;
  const maxAttempts = 20;
  for (let i = 0; i < nDice; i++) {
    let iAttempt = 0;
    do {
      rnd = {
        x: Math.random(),
        y: Math.random()
      }
      pos = {
        x: rnd.x * ( rollAreaDims.width - diceSize * 1.75 ) + diceSize/4,
        y: rnd.y * ( rollAreaDims.height - diceSize * 1.75 ) + diceSize/4
      };
    } while (
      !checkCircleCollision(dice, minDistance, pos) &&
      ++iAttempt <= maxAttempts
    );
    dice[i] = {
      value: getRandomIntIncl(1, 6),
      rnd: rnd,
      pos: pos,
      rot: Math.random()
    };
  }

  return dice;
}

export function getWinnerIndex(players) {
  const wormScores = players.map(player => getWormScore(player.tiles));
  const winnerWormScore = Math.max(...wormScores);
  const winnerIndices = wormScores.reduce((acc, curr, index) => {
      if (curr === winnerWormScore) acc.push(index);
      return acc;
    }, []);
  if (winnerIndices.length === 1) {
    return wormScores.indexOf(winnerWormScore);
  } else {
    const winnerHighTiles = winnerIndices.map(index =>
      Math.max(...players[index].tiles));
    return winnerIndices[
        winnerHighTiles.indexOf(Math.max(...winnerHighTiles))
      ];
  }
}
