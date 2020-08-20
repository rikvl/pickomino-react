import React from 'react';

const ControlButtons = ({
  gameId,
  gameData,
  isMyTurn,
  canPickDice,
  canPickTile,
  rollDice,
  stopRolling,
  resetGame,
  saveAreaDims,
  rollAreaDims
}) => {

  function handleResetClick() {
    if (gameData.winnerIndex === -1) {
      if (!window.confirm('Reset the current game progress?')) return;
    }
    resetGame(gameId, gameData);
  }

  return (
    <div className='flex-col'>
      <button
        className='btn'
        onClick={() => rollDice(gameId, gameData, saveAreaDims, rollAreaDims)}
        disabled={
          !isMyTurn ||
          gameData.justRolledDice ||
          gameData.nDiceLeft === 0
        }
      >
        Roll
      </button>
      <button
        className='btn'
        onClick={() => stopRolling(gameId, gameData, canPickTile)}
        disabled={
          !isMyTurn ||
          gameData.nDiceLeft === 8 ||
          (gameData.justRolledDice && canPickDice)
        }
      >
        Stop
      </button>
      <button
        className='btn'
        onClick={handleResetClick}
      >
        {gameData.winnerIndex === -1 ? 'Reset Game' : 'New Game'}
      </button>
    </div>
  );
}
export default ControlButtons;