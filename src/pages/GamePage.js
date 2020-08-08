import React, { useState, useEffect, useContext } from 'react';

import { UserContext } from '../context';
import { getGame, streamGame, postEvent } from '../firebase';
import {
  getRandomIntIncl,
  checkCollision,
  tileValuesAll,
  getWinnerIndex
} from '../utils';

import PlayerZone from '../components/PlayerZone';
import TableTiles from '../components/TableTiles';
import DiceSaveArea from '../components/DiceSaveArea';
import DiceRollArea from '../components/DiceRollArea';

import Logo from '../assets/logo192.png';

let callCount = 0;
let eventCount = 0;

function GamePage({ match }) {
  const uid = useContext(UserContext);
  const gameId = match.params.id;

  const [loadingGame, setLoadingGame] = useState(true);

  const [event, setEvent] = useState({});

  const [winnerIndex, setWinnerIndex] = useState(-1);
  const [nDiceLeft, setNDiceLeft] = useState(8);
  const [score, setScore] = useState(0);

  const [diceRolled, setDiceRolled] = useState([]);
  const [diceSavedVals, setDiceSavedVals] = useState([]);

  const [tilesTable, setTilesTable] = useState(tileValuesAll);
  const [stealableTiles, setStealableTiles] = useState([]);

  const [players, setPlayers] = useState([]);
  const [nPlayers, setNPlayers] = useState(null);

  const [currPlayerIndex, setCurrPlayerIndex] = useState(0);

  const [currUid, setCurrUid] = useState(null);

  const [justRolledDice, setJustRolledDice] = useState(false);
  const [justPickedDice, setJustPickedDice] = useState(false);

  const [canPickDice, setCanPickDice] = useState(false);
  const [canPickTile, setCanPickTile] = useState(false);

  console.log(callCount++);

  useEffect(() => {
    
    async function initGame() {
      const game = await getGame(gameId);
      if (game.exists && game.get('users').length > 0) {
        setPlayers(game.get('users').map(player => {
          return {
            ...player,
            tiles: []
          };
        }));
        setNPlayers(game.get('users').length);
        setLoadingGame(false);
      }
    }

    if (loadingGame) {
      console.log('starting1');
      initGame();
    }
  }, [loadingGame, gameId]);

  useEffect(() => {
    console.log('starting2');
    const unsubscribe = streamGame(gameId, snapshot => {
      setEvent(snapshot.get('event'));
    });

    return unsubscribe;
  }, [gameId]);

  // useEffect(() => {
  //   console.log('starting');
  //   const unsubscribe = streamGame(gameId, snapshot => {
  //     setEvent(snapshot.get('event'));
  //   });

  //   getGame(gameId)
  //     .then(doc => {
  //       setPlayers(doc.get('users').map(player => {
  //         return {
  //           ...player,
  //           tiles: []
  //         };
  //       }))
  //       setNPlayers(doc.get('users').length);
  //     })
  //     .then(setLoadingGame(false));

  //   return unsubscribe;
  // }, [gameId]);

  useEffect(() => {
    if (!loadingGame && event.type) {
      console.log(eventCount++, event.type);
      switch (event.type) {

        case 'startGame':
          setTilesTable(tileValuesAll);
          setDiceRolled([]);
          setDiceSavedVals([]);
          setPlayers(currPlayers => currPlayers.map(player =>
            ({
              ...player,
              tiles: []
            })
          ));
          setWinnerIndex(-1);
          setCurrPlayerIndex(event.data.currPlayerIndex);
          break;

        case 'rollDice':
          setDiceRolled(event.data.diceRolled);
          break;

        case 'pickDice':
          setDiceRolled(event.data.diceRolled);
          setDiceSavedVals(event.data.updatedDiceSavedVals);
          break;

        case 'pickTableTile':
          setTilesTable(event.data.tilesTable);
          setPlayers(event.data.players);
          nextPlayer();
          break;

        case 'stealTile':
          setPlayers(event.data.players);
          nextPlayer();
          break;

        case 'handBackTile':
          setTilesTable(event.data.tableTiles);
          setPlayers(event.data.players);
          nextPlayer();
          break;

        case 'stopRolling':
          nextPlayer();
          break;

        default:
          console.log('default');
        
      }
    }

    function nextPlayer() {
      setDiceRolled([]);
      setDiceSavedVals([]);
      setCurrPlayerIndex(index => (index + 1) % nPlayers);
    }
  }, [loadingGame, event, nPlayers]);

  useEffect(() => {
    if (!loadingGame) {
      setCurrUid(players[currPlayerIndex].userId);
      setStealableTiles(players.map((user, index) =>
        index === currPlayerIndex || user.tiles.length === 0 ?
        null : [...user.tiles].pop()));
    }
  }, [loadingGame, players, currPlayerIndex]);

  useEffect(() => {
    if (!loadingGame) {
      setScore(diceSavedVals.reduce((acc, curr) => acc + Math.min(curr, 5), 0));
      setNDiceLeft(8 - diceSavedVals.length);
    }
  }, [loadingGame, diceSavedVals]);

  useEffect(() => {
    if (!loadingGame) {
      if (tilesTable.length === 0) {
        setWinnerIndex(getWinnerIndex(players));
        setJustPickedDice(false);
        setJustRolledDice(true);
      }
    }
  }, [loadingGame, tilesTable, players]);

  useEffect(() => {
    if (!loadingGame) {
      setCanPickDice(
        uid === currUid &&
        !justPickedDice &&
        !diceRolled
          .map(dice => dice.value)
          .every(val => diceSavedVals.includes(val))
      )
    }
  }, [loadingGame, uid, currUid, justPickedDice, diceRolled, diceSavedVals]);

  useEffect(() => {
    if (!loadingGame) {
      setCanPickTile(
        uid === currUid &&
        !justRolledDice &&
        diceSavedVals.includes(6) &&
        (
          score >= Math.min(...tilesTable) ||
          stealableTiles.includes(score))
      )
    }
  }, [loadingGame, uid, currUid, justRolledDice, diceSavedVals, score, tilesTable, stealableTiles]);

  function rollRemainingDice() {
    const dice = [];
    const minDistance = 50 * Math.sqrt(2);
    let xPosNew, yPosNew;
    for (let i = 0; i < nDiceLeft; i++) {
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
    postEvent(gameId, 'rollDice', {
      diceRolled: dice
    });
    setJustPickedDice(false);
    setJustRolledDice(true);
  }

  function stopRolling() {
    if (canPickTile) {
      alert('pick a tile');
      return;
    }

    if (players[currPlayerIndex].tiles.length > 0) {
      handBackTile();
    } else {
      postEvent(gameId, 'stopRolling', null);
    }
    setJustPickedDice(false);
    setJustRolledDice(false);
  }

  function handBackTile() {
    const tileValue = [...players[currPlayerIndex].tiles].pop();
    const updatedTableTiles = 
      tileValue > Math.max(...tilesTable) ? (
        [...tilesTable, tileValue].sort()
      ) : (
        [...tilesTable.slice(0, -1), tileValue].sort()
      );
    const updatedPlayers = players.map((player, index) =>
      index === currPlayerIndex ? (
        {
          ...player,
          tiles: [...player.tiles.slice(0,-1)]
        }
      ) : (
        player
      )
    );
    postEvent(gameId, 'handBackTile', {
      tableTiles: updatedTableTiles,
      players: updatedPlayers
    })
  }

  function handleDiceClick(clickedValue) {
    const diceLeft = diceRolled.filter(dice => dice.value !== clickedValue);
    const dicePicked = diceRolled.filter(dice => dice.value === clickedValue);
    const updatedDiceSavedVals =
      [...diceSavedVals, ...dicePicked.map(dice => dice.value)];
    postEvent(gameId, 'pickDice', {
      diceRolled: diceLeft,
      updatedDiceSavedVals: updatedDiceSavedVals
    });
    setJustPickedDice(true);
    setJustRolledDice(false);
  }

  function handleTableTileClick(clickedValue) {
    const tilesLeft = tilesTable.filter(value => value !== clickedValue);
    const updatedPlayers = players.map((player, index) =>
      index === currPlayerIndex ? (
        {
          ...player,
          tiles: [...player.tiles, clickedValue]
        }
      ) : (
        player
      )
    );
    postEvent(gameId, 'pickTableTile', {
      tilesTable: tilesLeft,
      players: updatedPlayers
    });
  }

  function handleTileSteal(clickedValue) {
    const victimIndex = stealableTiles.findIndex(val => val === clickedValue);
    const updatedPlayers = players.map((player, index) => {
      if (index === currPlayerIndex) {
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
    postEvent(gameId, 'stealTile', {
      players: updatedPlayers
    });
  }

  function confirmReset() {
    if (window.confirm('Reset the current game progress?')) resetGame();
  }

  function resetGame() {
    postEvent(gameId, 'startGame', {
      currPlayerIndex: getRandomIntIncl(0, players.length-1)
    });
    setJustPickedDice(true);
    setJustRolledDice(false);
  }

  const ScoreText = () => (
    <div style={{margin: 'auto'}}>
      Score:&nbsp;
      {score}
      &nbsp;
      {diceSavedVals.includes(6) ? '\u2714' : ''}
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
          nDiceLeft === 0
        }
      >
        Roll
      </button>
      <button
        className='btn'
        onClick={stopRolling}
        disabled={
          uid !== currUid ||
          nDiceLeft === 8 ||
          (justRolledDice && canPickDice)
        }
      >
        Stop
      </button>
      <button
        className='btn'
        onClick={winnerIndex === -1 ? confirmReset : resetGame}
        disabled={false}
      >
        {winnerIndex === -1 ? 'Reset Game' : 'New Game'}
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
        players={players}
        currPlayer={currPlayerIndex}
        winnerIndex={winnerIndex}
        score={score}
        canPickTile={canPickTile}
        handleClick={handleTileSteal}
      />
      <div className='table-zone'>
        <TableTiles
          values={tilesTable}
          score={score}
          canPickTile={canPickTile}
          handleClick={handleTableTileClick}
        />
        <img
          style={{margin: 'auto'}}
          src={Logo}
          alt='worm'
          width='75%'
        />
        <DiceSaveArea
          values={diceSavedVals}
          disabled={true}
        />
        <ScoreText />
        <DiceRollArea
          dice={diceRolled}
          canPickDice={canPickDice}
          diceSavedVals={diceSavedVals}
          handleClick={handleDiceClick}
        />
        <ButtonArea />
      </div>
    </div>
  )
}

export default GamePage;
