import React, { useState, useEffect, useContext } from 'react';
import { Redirect } from 'react-router-dom';

import { UserContext } from '../context';

import { streamGame, getGame, updateGame } from '../firebase';

import { getRandomIntIncl } from '../utils/common';

import Logo from '../assets/logo192.png';

import LinkSharing from '../components/LinkSharing';
import EnterRoomForm from '../components/EnterRoomForm';

function RoomPage({ match }) {
  const uid = useContext(UserContext);
  const gameId = match.params.id;

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userPresent, setUserPresent] = useState(true);

  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    setLoadingUsers(true);
    const unsubscribe = streamGame(gameId, snapshot => {
      const gameData = snapshot.get('data');
      setUsers(gameData.players);
      setUserPresent(gameData.players.map(user => user.userId).includes(uid));
      setLoadingUsers(false);
      if (gameData.status === 'ingame') setRedirect(`/game/${gameId}`);
    });

    return unsubscribe;
  }, [gameId, uid]);

  const UserNameList = () => {
    const userNameList = users.map((user, index) =>
      <h3 key={index}>
        {user.name}
      </h3>
    );

    return (
      <div>
        <h4>Users present in this waiting room:</h4>
        {userNameList}
      </div>
    )
  };

  async function StartGame() {
    const game = await getGame(gameId);
    updateGame(gameId, {
      ...game.get('data'),
      status: 'ingame',
      currPlayerIndex: getRandomIntIncl(0, users.length-1)
    });
    setRedirect(`/game/${gameId}`);
  }

  const StartGameButton = () => {
    return (
      <form>
        <button
          className='submit-btn'
          type='button'
          onClick={StartGame}
        >
          Everyone's in!
        </button>
      </form>
    )
  }

  if (redirect) return <Redirect push to={redirect} />;

  return (
    <div className='flex-col'>
      <h1>Pickomino Online</h1>
      <br />
      <span>Share this link with your friends:</span>
      <LinkSharing />
      {loadingUsers ? (
        <h5>Loading user list...</h5>
      ) : (
        <div>
          <UserNameList />
          {userPresent ? <StartGameButton /> : <EnterRoomForm gameId={gameId} />}
        </div>
      )}
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

export default RoomPage