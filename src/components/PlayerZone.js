import React from 'react';

import PlayerArea from './PlayerArea'

const PlayerZone = (props) => {
  const playerAreas = props.players.map((player, index) =>
    <PlayerArea
      key={index}
      player={player}
      isCurrPlayer={props.winnerIndex === -1 && index === props.currPlayer}
      isWinner={index === props.winnerIndex}
      score={props.score}
      canPickTile={props.canPickTile}
      handleClick={props.handleClick}
    />
  );

  return (
    <div className='flex-col'>
      {playerAreas}
    </div>
  )
}

export default PlayerZone
