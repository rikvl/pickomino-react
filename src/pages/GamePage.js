import React, { useState, useEffect, useContext, useRef } from 'react';

import { UserContext } from '../context';

import { getGame, streamGame } from '../firebase';

import {
  rollDice,
  stopRolling,
  handleDiceClick,
  handleTableTileClick,
  handleTileSteal,
  resetGame
} from '../GameEvents';

import useContainerDimensions from '../hooks/useContainerDimensions';

import PlayerZone from '../components/PlayerZone';
import TableTiles from '../components/TableTiles';
import DiceSaveArea from '../components/DiceSaveArea';
import DiceRollArea from '../components/DiceRollArea';
import ScoreText from '../components/ScoreText';
import ControlButtons from '../components/ControlButtons';

import Logo from '../assets/logo192.png';

function GamePage({ match }) {
  const uid = useContext(UserContext);
  const gameId = match.params.id;

  const [loadingGame, setLoadingGame] = useState(true);
  const [gameData, setGameData] = useState({
    status: 'waiting',
    players: [],
    currPlayerIndex: null,
    currUid: null,
    winnerIndex: -1,
    nDiceLeft: 8,
    diceRolled: [],
    diceSavedVals: [],
    score: 0,
    tilesTable: [],
    stealableTiles: [],
    justRolledDice: false,
    justPickedDice: false
  });

  const [isMyTurn, setIsMyTurn] = useState(false);
  const [canPickDice, setCanPickDice] = useState(false);
  const [canPickTile, setCanPickTile] = useState(false);

  const saveAreaRef = useRef(null);
  const rollAreaRef = useRef(null);
  const saveAreaDims = useContainerDimensions(saveAreaRef, loadingGame);
  const rollAreaDims = useContainerDimensions(rollAreaRef, loadingGame);

  useEffect(() => {
    
    async function initGame() {
      const game = await getGame(gameId);
      if (game.exists) {
        setGameData(game.get('data'));
        setLoadingGame(false);
      }
    }

    initGame();

    const unsubscribe = streamGame(gameId, snapshot => {
      setGameData(snapshot.get('data'));
    });

    return unsubscribe;
  }, [gameId]);

  useEffect(() => {
    if (!loadingGame) {
      setIsMyTurn(uid === gameData.players[gameData.currPlayerIndex].userId);
    }
  }, [loadingGame, uid, gameData.players, gameData.currPlayerIndex]);

  useEffect(() => {
    if (!loadingGame) {
      setGameData(curr => {
        return {
          ...curr,
          stealableTiles: gameData.players.map((user, index) =>
            index === gameData.currPlayerIndex || user.tiles.length === 0 ?
            null : [...user.tiles].pop())
        };
      });
    }
  }, [loadingGame, gameData.players, gameData.currPlayerIndex]);

  useEffect(() => {
    if (!loadingGame) {
      setGameData(curr => {
        return {
          ...curr,
          nDiceLeft: 8 - gameData.diceSavedVals.length,
          score: gameData.diceSavedVals.reduce((acc, curr) =>
            acc + Math.min(curr, 5), 0)
        };
      });
    }
  }, [loadingGame, gameData.diceSavedVals]);

  useEffect(() => {
    if (!loadingGame) {
      setCanPickDice(
        isMyTurn &&
        !gameData.justPickedDice &&
        !gameData.diceRolled
          .map(dice => dice.value)
          .every(val => gameData.diceSavedVals.includes(val))
      )
    }
  }, [
    loadingGame,
    isMyTurn,
    gameData.justPickedDice,
    gameData.diceRolled,
    gameData.diceSavedVals
  ]);

  useEffect(() => {
    if (!loadingGame) {
      setCanPickTile(
        isMyTurn &&
        !gameData.justRolledDice &&
        gameData.diceSavedVals.includes(6) &&
        (
          gameData.score >= Math.min(...gameData.tilesTable) ||
          gameData.stealableTiles.includes(gameData.score))
      )
    }
  }, [
    loadingGame,
    isMyTurn,
    gameData.justRolledDice,
    gameData.diceSavedVals,
    gameData.score,
    gameData.tilesTable,
    gameData.stealableTiles
  ]);

  if (loadingGame) {
    return (
      <h1>Loading...</h1>
    )
  }

  return (
    <div className='game'>
      <PlayerZone
        gameId={gameId}
        gameData={gameData}
        canPickTile={canPickTile}
        handleClick={handleTileSteal}
      />
      <div className='table-zone'>
        <TableTiles
          gameId={gameId}
          gameData={gameData}
          canPickTile={canPickTile}
          handleClick={handleTableTileClick}
        />
        <img
          className='logo'
          src={Logo}
          alt='worm'
          width='75%'
        />
        <div ref={saveAreaRef} className='dice-area'>
          <DiceSaveArea
            gameData={gameData}
          />
        </div>
        <ScoreText gameData={gameData} />
        <div ref={rollAreaRef} className='roll-area'>
          <DiceRollArea
            gameId={gameId}
            gameData={gameData}
            canPickDice={canPickDice}
            handleClick={handleDiceClick}
            saveAreaDims={saveAreaDims}
            rollAreaDims={rollAreaDims}
          />
        </div>
        <ControlButtons
          gameId={gameId}
          gameData={gameData}
          isMyTurn={isMyTurn}
          canPickDice={canPickDice}
          canPickTile={canPickTile}
          rollDice={rollDice}
          stopRolling={stopRolling}
          resetGame={resetGame}
          saveAreaDims={saveAreaDims}
          rollAreaDims={rollAreaDims}
        />
      </div>
    </div>
  )
}

export default GamePage;
