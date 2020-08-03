import React from 'react'

import Tile from './Tile'

const PlayerArea = (props) => {
  const pickableValue = !props.isCurrPlayer && props.canPickTile &&
    [...props.player.tiles].pop() === props.score && props.score;
  const tiles = props.player.tiles.map((value, index) =>
    <Tile
      key={index}
      value={value}
      disabled={!(value === pickableValue)}
      handleClick={props.handleClick}
    />
  );

  const style = {
    color: props.isWinner ? 'gold' : props.isCurrPlayer && 'red'
  }
  
  return (
    <div className='player-area'>
      <div
        style={style}
      >
        {props.player.name} ({props.player.worms})
      </div>
      <div className='tile-area'>
        {tiles}
      </div>
    </div>
  );
}

export default PlayerArea