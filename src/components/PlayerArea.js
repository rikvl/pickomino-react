import React from 'react'

import { getWormScore } from '../utils/GameUtils';

import Tile from './Tile'

const PlayerArea = ({
  gameId,
  gameData,
  player,
  isCurrPlayer,
  isWinner,
  canPickTile,
  handleClick
}) => {
  const wormScore = getWormScore(player.tiles);
  const pickableValue = !isCurrPlayer && canPickTile &&
    [...player.tiles].pop() === gameData.score && gameData.score;
  const tiles = player.tiles.map((value, index) =>
    <Tile
      key={index}
      gameId={gameId}
      gameData={gameData}
      value={value}
      disabled={!(value === pickableValue)}
      handleClick={handleClick}
    />
  );

  const style = {
    color: isWinner ? 'gold' : isCurrPlayer && 'red'
  }
  
  return (
    <div className='player-area'>
      <div style={style}>
        {player.name}
        &nbsp;({wormScore})
      </div>
      <div className='tile-area'>
        {tiles}
      </div>
    </div>
  );
}

export default PlayerArea
