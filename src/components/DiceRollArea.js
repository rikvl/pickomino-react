import React from 'react'

import Dice from './Dice'

const DiceRollArea = ({
  gameId,
  gameData,
  canPickDice,
  handleClick,
  saveAreaDims,
  rollAreaDims
}) => {
  const diceSize = saveAreaDims.height / 1.2;
  const rolledDice = gameData.diceRolled.map(({value, rnd, rot}, index) => {
    const pos = {
      x: rnd.x * ( rollAreaDims.width - diceSize * 1.75 ) + diceSize/4,
      y: rnd.y * ( rollAreaDims.height - diceSize * 1.75 ) + diceSize/4
    };

    return (
      <Dice
        key={index}
        gameId={gameId}
        gameData={gameData}
        value={value}
        disabled={!canPickDice || gameData.diceSavedVals.includes(value)}
        handleClick={handleClick}
        style={{
          position: 'absolute',
          transform: `
              translate(
                ${pos.x}px,
                ${pos.y}px
              )
              rotate(${rot}turn)
            `
        }}
      />
    )
  });
  
  return (
    <div>
      {rolledDice}
    </div>
  );
}

export default DiceRollArea
