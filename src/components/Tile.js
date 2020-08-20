import React from 'react';

import { getWormValue } from '../utils/GameUtils'

const Tile = ({ gameId, gameData, value, disabled, handleClick }) => {
  const wormValue = getWormValue(value);
  const wormString = wormValue === 4 ? 'IV' : 'I'.repeat(wormValue);

  return (
      <button
        className='tile'
        disabled={disabled}
        onClick={() => handleClick(gameId, gameData, value)}
      >
        <span className='tile-value-text'>{value}</span>
        <hr />
        <span className='tile-worm-text'>{wormString}</span>
      </button>
    );
}

export default Tile
