import React, { useContext } from 'react';

import { UserContext } from '../context';

import useCustomForm from '../hooks/useCustomForm';

import { addUserToGame } from '../firebase';

import { generateUserName } from '../utils/NameUtils';

const initialValues = {
  userName: generateUserName()
}

function EnterRoomForm({ gameId }) {
  const uid = useContext(UserContext);

  const {
    values,
    handleChange,
    handleSubmit
  } = useCustomForm({
    initialValues,
    onSubmit: ({ values, errors }) =>
      addUserToGame(gameId, uid, values.userName)
  });

  return (
    <form onSubmit={handleSubmit}>
      <br />
      <label>
        Your Username:
        <br />
        <input
          type='text'
          value={values.userName}
          name='userName'
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <br />
      <button className='submit-btn' type='submit'>Ready</button>
    </form>
  );
}

export default EnterRoomForm;
