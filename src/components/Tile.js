import React from 'react';

import { getWormValue } from '../utils'

const Tile = (props) => {
  const wormValue = getWormValue(props.value);
  const wormString = wormValue === 4 ? 'IV' : 'I'.repeat(wormValue);

  return (
      <button
        className='tile'
        disabled={props.disabled}
        onClick={() => props.handleClick(props.value)}
      >
        <span className='tile-value-text'>{props.value}</span>
        <hr />
        <span className='tile-worm-text'>{wormString}</span>
      </button>
    );
}

export default Tile
