import React from 'react'

import Tile from './Tile';

import { tileValsAll } from '../utils/GameUtils';

const TableTiles = ({gameId, gameData, canPickTile, handleClick}) => {
  const pickableValue = canPickTile &&
    gameData.tilesTable.filter(value => value <= gameData.score).pop();
  const tiles = tileValsAll.map((value, index) => 
    gameData.tilesTable.includes(value) ? (
      <Tile
        key={index}
        gameId={gameId}
        gameData={gameData}
        value={value}
        disabled={!(value === pickableValue)}
        handleClick={handleClick}
      />
    ) : (
      <div key={index} />
    )
  );
  
  return (gameData.status === 'finished') ? (
    <div style={{
      margin: '0 auto',
      textAlign: 'center'
    }}>
      The winner is {gameData.players[gameData.winnerIndex].name}!
    </div>
  ) : (
    <div className='table-tiles'>
      {tiles}
    </div>
  );
}

export default TableTiles
