import React, { useState, useEffect, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { UserContext } from '../context';
import { createGame, addUserToGame } from '../firebase';
import { generateUserName, generateGameName, getFlagUrl } from '../utils';

import Logo from '../assets/logo192.png';

function LobbyPage() {
  const uid = useContext(UserContext);
  const [flagURL, setFlagURL] = useState(null);
  const [redirect, setRedirect] = useState(null);
  const [formData, setFormData] = useState({
    gameName: '',
    userName: ''
  });

  useEffect(() => {
    // initialize form
    generateGameName()
      .then(gameName =>
        setFormData({
          gameName: gameName,
          userName: generateUserName()
        })
      );
    
    // set user flag url
    getFlagUrl()
      .then(res => setFlagURL(res));
  }, []);

  function handleChange(event) {
    const {name, value} = event.target;
    event.persist();
    setFormData(formData => ({ ...formData, [name]: value }));
  }

  function handleSubmit(event) {
    if (event) {
      event.preventDefault();
    }

    createGame(formData.gameName)
      .then(addUserToGame(formData.gameName, uid, formData.userName, flagURL))
      .then(setRedirect(`/room/${formData.gameName}`));
  }

  if (redirect) return <Redirect push to={redirect} />;

  return (
    <div className='flex-col'>
      <h1>Pickomino Online</h1>
      <br />
      <form onSubmit={handleSubmit}>
        <label>
          Game Name:
          <br />
          <input
            type='text'
            value={formData.gameName}
            name='gameName'
            onChange={handleChange}
          />
        </label>
        <br />
        <br />
        <label>
          Your Username:
          <br />
          <input
            type='text'
            value={formData.userName}
            name='userName'
            onChange={handleChange}
          />
        </label>
        <br />
        <br />
        <br />
        <button type='submit'>Create Game</button>
      </form>
      <br />
      <br />
      <br />
      <br />
      <img
        style={{margin: 'auto'}}
        src={Logo}
        alt='worm'
      />
    </div>
  )
}

export default LobbyPage;