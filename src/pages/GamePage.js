import React, { useState, useEffect, useContext } from 'react';

import { UserContext } from '../context';
import {
  getGame,
  updateGameData,
  streamGame,
  addUserTile,
  removeUserTile,
  transferUserTile,
  resetUsers
} from '../firebase';
import {
  getRandomIntIncl,
  checkCollision,
  tileValuesAll,
  getWinnerIndex
} from '../utils';

import PlayerZone from '../components/PlayerZone';
import TableTiles from '../components/TableTiles';
import DiceArea from '../components/DiceArea';
import RollArea from '../components/RollArea';

import WormBig from '../assets/worm-big.png';

let count = 0;

function GamePage({ match }) {
  const uid = useContext(UserContext);
  const gameId = match.params.id;
  const [loadingGame, setLoadingGame] = useState(true);
  const [startingGame, setStartingGame] = useState(true);
  const [gameData, setGameData] = useState({});
  const [currUid, setCurrUid] = useState(null);

  const [justRolledDice, setJustRolledDice] = useState(false);
  const [justPickedDice, setJustPickedDice] = useState(false);

  const [canPickDice, setCanPickDice] = useState(false);
  const [canPickTile, setCanPickTile] = useState(false);

  const [users, setUsers] = useState([]);

  console.log(count++);

  useEffect(() => {
    
    async function initGame() {
      const game = await getGame(gameId);
      if (game.exists && game.get('users').length > 0) {
        updateGameData(gameId, 'tilesTable', tileValuesAll);
        updateGameData(gameId, 'diceRolled', []);
        updateGameData(gameId, 'diceSavedVals', []);
        updateGameData(gameId, 'nDiceLeft', 8);
        resetUsers(gameId, game.get('users'));
        updateGameData(gameId, 'currPlayerIndex', 
          getRandomIntIncl(0, game.get('users').length-1));
        updateGameData(gameId, 'winnerIndex', -1);
        setStartingGame(false);
      }
    }

    if (startingGame) {
      console.log('starting');
      initGame();
    }
  }, [startingGame, gameId]);

  useEffect(() => {
    const unsubscribe = streamGame(gameId, snapshot => {
      const updatedUsers = snapshot.get('users');
      setUsers(updatedUsers);
      setGameData(snapshot.get('gameData'));
      setLoadingGame(false);
    });

    return unsubscribe;
  }, [gameId]);

  useEffect(() => {
    if (!loadingGame && !startingGame) {
      setCurrUid(users[gameData.currPlayerIndex].userId);
    }
  }, [gameId, loadingGame, startingGame, users, gameData]);

  useEffect(() => {
    if (!loadingGame && !startingGame) {
      setCanPickDice(
        uid === currUid &&
        !justPickedDice &&
        !gameData.diceRolled
          .map(dice => dice.value)
          .every(val => gameData.diceSavedVals.includes(val))
      )
    }
  }, [loadingGame, startingGame, justPickedDice, gameData, uid, currUid]);

  useEffect(() => {
    if (!loadingGame && !startingGame) {
      setCanPickTile(
        uid === currUid &&
        !justRolledDice &&
        gameData.diceSavedVals.includes(6) &&
        (
          gameData.score >= Math.min(...gameData.tilesTable) ||
          gameData.stealableTiles.includes(gameData.score))
      )
    }
  }, [loadingGame, startingGame, justRolledDice, gameData, uid, currUid]);

  useEffect(() => {
    if (!loadingGame && !startingGame) {
      const stealableTiles = users.map((user, index) =>
        index === gameData.currPlayerIndex || user.tiles.length === 0 ?
        null : [...user.tiles].pop());
      updateGameData(gameId, 'stealableTiles', stealableTiles);
    }
  }, [gameId, loadingGame, startingGame, users, gameData]);

  useEffect(() => {
    if (!loadingGame && !startingGame) {
      updateGameData(gameId,
        'score', gameData.diceSavedVals.reduce((acc, curr) =>
          acc + Math.min(curr, 5), 0));
    }
  }, [gameId, loadingGame, startingGame, gameData]);

  useEffect(() => {
    if (!loadingGame && !startingGame && gameData.tilesTable.length === 0) {
      updateGameData(gameId, 'winnerIndex', getWinnerIndex(users));
      setJustPickedDice(false);
      setJustRolledDice(true);
    }
  }, [gameId, loadingGame, startingGame, users, gameData]);

  function rollRemainingDice() {
    const dice = [];
    const minDistance = 50 * Math.sqrt(2);
    let xPosNew, yPosNew;
    for (let i = 0; i < gameData.nDiceLeft; i++) {
      do {
        xPosNew = Math.random() * 480 + 25;
        yPosNew = Math.random() * 300 + 25;
      } while (!checkCollision(dice, minDistance, xPosNew, yPosNew));
      dice[i] = {
        value: getRandomIntIncl(1, 6),
        xPos: xPosNew,
        yPos: yPosNew,
        rot: Math.random()
      };
    }
    updateGameData(gameId, 'diceRolled', dice);
    setJustPickedDice(false);
    setJustRolledDice(true);
  }

  function stopRolling() {
    if (canPickTile) {
      alert('pick a tile')
    } else {
      if (users[gameData.currPlayerIndex].tiles.length > 0) handBackTile();
      setJustPickedDice(false);
      setJustRolledDice(false);
      nextPlayer();
    }
  }

  function handBackTile() {
    const tileValue = [...users[gameData.currPlayerIndex].tiles].pop();
    removeUserTile(gameId, users, gameData.currPlayerIndex, tileValue);
    updateGameData(gameId, 'tilesTable', 
      tileValue > Math.max(...gameData.tilesTable) ?
      [...gameData.tilesTable, tileValue].sort() :
      [...gameData.tilesTable.slice(0, -1), tileValue].sort());
  }

  function pickDice(clickedValue) {
    const dicePicked = gameData.diceRolled.filter(dice =>
      dice.value === clickedValue);
    const diceLeft = gameData.diceRolled.filter(dice =>
      dice.value !== clickedValue);
    updateGameData(gameId, 'diceRolled', diceLeft);
    updateGameData(gameId, 'diceSavedVals',
      [...gameData.diceSavedVals, ...dicePicked.map(dice => dice.value)]);
    updateGameData(gameId, 'nDiceLeft', diceLeft.length);
    setJustPickedDice(true);
    setJustRolledDice(false);
  }

  function pickTile(clickedValue) {
    const tilesLeft = gameData.tilesTable.filter(value => value !== clickedValue);
    updateGameData(gameId, 'tilesTable', tilesLeft);
    addUserTile(gameId, users, gameData.currPlayerIndex, clickedValue);
    nextPlayer();
  }

  function handleTileSteal(clickedValue) {
    const stealerIndex = gameData.currPlayerIndex;
    const victimIndex = gameData.stealableTiles.findIndex(value =>
      value === clickedValue);
    transferUserTile(gameId, users, stealerIndex, victimIndex, clickedValue);
    nextPlayer();
  }

  function nextPlayer() {
    updateGameData(gameId, 'diceRolled', []);
    updateGameData(gameId, 'diceSavedVals', []);
    updateGameData(gameId, 'nDiceLeft', 8);
    updateGameData(gameId, 'currPlayerIndex',
      (gameData.currPlayerIndex + 1) % users.length);
  }

  function confirmReset() {
    if (window.confirm('Reset the current game progress?')) resetGame();
  }

  function resetGame() {
    setStartingGame(true);
    setJustPickedDice(true);
    setJustRolledDice(false);
  }

  const ScoreText = () => (
    <div style={{margin: 'auto'}}>
      Score:&nbsp;
      {gameData.score}
      &nbsp;
      {gameData.diceSavedVals.includes(6) ? '\u2714' : ''}
    </div>
  );

  const ButtonArea = () => (
    <div className='flex-col'>
      <button
        className='btn'
        onClick={rollRemainingDice}
        disabled={
          uid !== currUid ||
          justRolledDice ||
          gameData.nDiceLeft === 0
        }
      >
        Roll
      </button>
      <button
        className='btn'
        onClick={stopRolling}
        disabled={
          uid !== currUid ||
          gameData.nDiceLeft === 8 ||
          (justRolledDice && canPickDice)
        }
      >
        Stop
      </button>
      <button
        className='btn'
        onClick={gameData.winnerIndex === -1 ? confirmReset : resetGame}
        disabled={false}
      >
        {gameData.winnerIndex === -1 ? 'Reset Game' : 'New Game'}
      </button>
    </div>
  );

  if (loadingGame) {
    return (
      <h1>Loading...</h1>
    )
  }

  return (
    <div className='game'>
      <PlayerZone
        players={users}
        currPlayer={gameData.currPlayerIndex}
        winnerIndex={gameData.winnerIndex}
        score={gameData.score}
        canPickTile={canPickTile}
        handleClick={handleTileSteal}
      />
      <div className='table-zone'>
        <TableTiles
          values={gameData.tilesTable}
          score={gameData.score}
          canPickTile={canPickTile}
          handleClick={pickTile}
        />
        <img
          style={{margin: 'auto'}}
          src={WormBig}
          alt='worm'
          width='75%' />
        <DiceArea
          values={gameData.diceSavedVals}
          canPickDice={canPickDice}
          diceSavedVals={gameData.diceSavedVals}
          handleClick={pickDice}
        />
        <ScoreText />
        <RollArea
          dice={gameData.diceRolled}
          canPickDice={canPickDice}
          diceSavedVals={gameData.diceSavedVals}
          handleClick={pickDice}
        />
        <ButtonArea />
      </div>
    </div>
  )
}

export default GamePage;
