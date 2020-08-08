import React from 'react'

import Dice from './Dice'

const DiceRollArea = (props) => {
  const rolledDice = props.dice.map(({value, xPos, yPos, rot}, index) =>
    <Dice
      key={index}
      value={value}
      disabled={!props.canPickDice || props.diceSavedVals.includes(value)}
      handleClick={props.handleClick}
      style={{
        position: 'absolute',
        transform: `
            translate(
              ${xPos}px,
              ${yPos}px
            )
            rotate(${rot}turn)
          `
      }}
    />
  );
  
  return (
    <div className='roll-area'>
      {rolledDice}
    </div>
  );
}

export default DiceRollArea