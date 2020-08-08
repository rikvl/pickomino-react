import React from 'react'

import Dice from './Dice'

const DiceSaveArea = (props) => {
  const savedDice = props.values.map((value, index) =>
    <Dice
      key={index}
      value={value}
      disabled={props.disabled}
      handleClick={() => {}}
    />
  );
  
  return (
    <div className='dice-area'>
      {savedDice}
    </div>
  );
}

export default DiceSaveArea