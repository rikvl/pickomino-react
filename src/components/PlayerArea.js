import React from 'react'

import { getWormScore } from '../utils';

import Tile from './Tile'

const PlayerArea = (props) => {
  const wormScore = getWormScore(props.player.tiles);
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
        <img src={props.player.flag} alt='flag' height='16' />&nbsp;
        {props.player.name} ({wormScore})
      </div>
      <div className='tile-area'>
        {tiles}
      </div>
    </div>
  );
}

export default PlayerArea