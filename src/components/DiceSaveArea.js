import React from 'react'

import Dice from './Dice'

const DiceSaveArea = ({ gameData }) => {
  const savedDice = gameData.diceSavedVals.map((value, index) =>
    <Dice
      key={index}
      value={value}
      disabled={true}
      handleClick={() => {}}
    />
  );
  
  return (
    <div>
      {savedDice}
    </div>
  );
}

export default DiceSaveArea
