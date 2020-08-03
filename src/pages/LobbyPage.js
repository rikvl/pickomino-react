import React, { useState, useEffect, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { UserContext } from '../context';
import { createGame } from '../firebase';
import { generateUserName, generateGameName } from '../utils';

function LobbyPage() {
  const uid = useContext(UserContext);
  const [redirect, setRedirect] = useState(null);
  const [formData, setFormData] = useState({
    gameName: '',
    userName: ''
  });

  useEffect(() => {
    initForm();
  }, []);

  async function initForm() {
    const gameName = await generateGameName();
    setFormData({
      gameName: gameName,
      userName: generateUserName()
    })
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

    createGame(formData.gameName, uid, formData.userName);

    alert(`
      Game created!\n
      Game name: ${formData.gameName}\n
      Created by\n
      User ID: ${uid}\n
      User name: ${formData.userName}
    `);

    setRedirect(`/room/${formData.gameName}`);
  }

  if (redirect) return <Redirect push to={redirect} />;

  return (
    <div className='flex-col'>
      <h2>Pickomino Online - Lobby</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Game Name:
          <br />
          <input
            type='text'
            value={formData.gameName}
            name='gameName'
            onChange={handleChange} />
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
            onChange={handleChange} />
        </label>
        <br />
        <br />
        <button type='submit'>Ready</button>
      </form>
    </div>
  )
}

export default LobbyPage;