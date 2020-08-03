import React from 'react'

import Dice from './Dice'

const DiceArea = (props) => {
  const dice = props.values.map((value, index) =>
    <Dice
      key={index}
      value={value}
      disabled={!props.canPickDice || props.diceSavedVals.includes(value)}
      handleClick={props.handleClick}
    />
  );
  
  return (
    <div className='dice-area'>
      {dice}
    </div>
  );
}

export default DiceArea