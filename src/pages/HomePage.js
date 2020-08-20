import React, { useState, useEffect, useContext } from 'react';
import { Redirect } from 'react-router-dom';

import { UserContext } from '../context';

import { createGame, addUserToGame } from '../firebase';

import { generateUserName, generateGameName } from '../utils/NameUtils';

import Logo from '../assets/logo192.png';

function LobbyPage() {
  const uid = useContext(UserContext);
  const [redirect, setRedirect] = useState(null);
  const [formData, setFormData] = useState({
    gameName: '',
    userName: ''
  });

  useEffect(() => {
    // initialize form
    renewGameName();
    renewUserName();
  }, []);

  function renewGameName() {
    generateGameName()
      .then(gameName =>
        setFormData(curr => {
          return {
            gameName: gameName,
            userName: curr.userName
          };
        })
      );
  }

  function renewUserName() {
    setFormData(curr => {
      return {
        gameName: curr.gameName,
        userName: generateUserName()
      };
    });
  }

  function handleChange(event) {
    const {name, value} = event.target;
    event.persist();
    setFormData(formData => ({ ...formData, [name]: value }));
  }

  function handleSubmit(event) {
    if (event) {
      event.preventDefault();
    }

    createGame(formData.gameName);
    addUserToGame(formData.gameName, uid, formData.userName);
    setRedirect(`/room/${formData.gameName}`);
  }

  if (redirect) return <Redirect push to={redirect} />;

  return (
    <div className='flex-col'>
      <h1>Pickomino Online</h1>
      <br />
      <form onSubmit={handleSubmit}>
        <div className='form-element'>
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
          <button type='button' onClick={renewGameName}>&#x21bb;</button>
        </div>
        <div className='form-element'>
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
          <button type='button' onClick={renewUserName}>&#x21bb;</button>
        </div>
        <br />
        <div className='form-element'>
          <button className='submit-btn' type='submit'>Create Game</button>
        </div>
      </form>
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