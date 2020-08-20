import React from 'react';

const Dice = ({
  gameId,
  gameData,
  value,
  disabled,
  handleClick,
  style
}) => (
  <button
    className='dice'
    style={style}
    disabled={disabled}
    onClick={() => handleClick(gameId, gameData, value)}
  >
    {value === 6 ? (
      <img
        src={require('../assets/worm.svg')}
        alt='worm'
      />
    ) : (
      <img
        src={require(`../assets/dice-${value}.svg`)}
        alt={`${value}`}
      />
    )}
  </button>
);

export default Dice
