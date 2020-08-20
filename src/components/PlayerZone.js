import React from 'react';

import PlayerArea from './PlayerArea'

const PlayerZone = ({ gameId, gameData, canPickTile, handleClick }) => {
  const playerAreas = gameData.players.map((player, index) =>
    <PlayerArea
      key={index}
      gameId={gameId}
      gameData={gameData}
      player={player}
      isCurrPlayer={
        gameData.winnerIndex === -1 &&
        index === gameData.currPlayerIndex
      }
      isWinner={index === gameData.winnerIndex}
      canPickTile={canPickTile}
      handleClick={handleClick}
    />
  );

  return (
    <div className='player-zone flex-col'>
      {playerAreas}
    </div>
  )
}

export default PlayerZone
