import React, { useState, useEffect, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { UserContext } from '../context';
import { addUserToGame, streamGame } from '../firebase';
import { generateUserName } from '../utils';

function RoomPage({ match }) {
  const uid = useContext(UserContext);
  const gameId = match.params.id;
  const [loading, setLoading] = useState(true);
  const [redirect, setRedirect] = useState(null);
  const [userPresent, setUserPresent] = useState(true);
  const [newUserName, setNewUserName] = useState(generateUserName());
  const [users, setUsers] = useState([{
    userId: 'Loading user ID...',
    name: 'Loading user names...',
    tiles: [],
    worms: 0
  }]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = streamGame(gameId, snapshot => {
      setUsers(snapshot.get('users'));
      setLoading(false);
    });

    return unsubscribe;
  }, [gameId]);

  useEffect(() => {
    const userIdList = users.map(user => user.userId);
    setUserPresent(userIdList.includes(uid));
  }, [users, uid]);

  const UserNameList = () => {
    const userNameList = users.map((user, index) =>
      <h5 key={index}>
        {user.name}
      </h5>);

    return (
      <div>
        <h4>Users present:</h4>
        {userNameList}
      </div>
    )
  };

  function handleChange(event) {
    const {value} = event.target;
    event.persist();
    setNewUserName(value);
  }

  function handleSubmit(event) {
    if (event) {
      event.preventDefault();
    }

    addUserToGame(gameId, uid, newUserName);
  }

  const EnterRoomForm = () => {
    return (
      <form onSubmit={handleSubmit}>
        <label>
          Your Username:
          <br />
          <input
            type='text'
            value={newUserName}
            name='userName'
            onChange={handleChange} />
        </label>
        <br />
        <br />
        <button type='submit'>Ready</button>
      </form>
    )
  }

  const StartGameButton = () => {
    return (
      <button
        type='button'
        onClick={() => setRedirect(`/game/${gameId}`)}
      >
        Everyone's in!
      </button>
    )
  }

  if (redirect) return <Redirect push to={redirect} />;

  return (
    <div>
      <h2>Pickomino Online - Waiting Room</h2>
      <h4>Game name: {gameId}</h4>
      {loading ? (
        <h5>Loading user list...</h5>
      ) : (
        <div>
          <UserNameList />
          {userPresent ? <StartGameButton /> : <EnterRoomForm />}
        </div>
      )}
    </div>
  )
}

export default RoomPage