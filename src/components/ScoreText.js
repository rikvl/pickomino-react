import React from 'react';

const ScoreText = ({ gameData }) => (
  <div style={{margin: 'auto'}}>
    Score:&nbsp;
    {gameData.score}
    &nbsp;
    {gameData.diceSavedVals.includes(6) ? '\u2714' : ''}
  </div>
);

export default ScoreText;