import React from 'react'

import Tile from './Tile';

import { tileValuesAll } from '../utils';

const TableTiles = (props) => {
  const pickableValue = props.canPickTile &&
    props.values.filter(value => value <= props.score).pop();
  const tiles = tileValuesAll.map((value, index) => 
    props.values.includes(value) ? (
      <Tile
        key={index}
        value={value}
        disabled={!(value === pickableValue)}
        handleClick={props.handleClick}
      />
    ) : (
      <div key={index} className='tile' />
    )
  );
  
  return (
    <div className='table-tiles'>
      {tiles}
    </div>
  );
}

export default TableTiles
