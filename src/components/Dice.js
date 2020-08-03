import React from 'react';

const Dice = (props) => 
  <button
    className='dice'
    style={props.style}
    disabled={props.disabled}
    onClick={() => props.handleClick(props.value)}
  >
    {props.value === 6 ? (
      <img
        src={require('../assets/worm.svg')}
        alt='worm'
      />
    ) : (
      <img
        src={require(`../assets/dice-${props.value}.svg`)}
        alt='worm'
      />
    )}
  </button>

export default Dice