import React, { useState, useEffect, useContext, useRef } from 'react';
import { Redirect } from 'react-router-dom';
import { UserContext } from '../context';
import { addUserToGame, streamGame, postEvent } from '../firebase';
import { generateUserName, getFlagUrl, getRandomIntIncl } from '../utils';

import Logo from '../assets/logo192.png';

function RoomPage({ match }) {
  const uid = useContext(UserContext);
  const gameId = match.params.id;
  const [flagURL, setFlagURL] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirect, setRedirect] = useState(null);
  const textInputRef = useRef(null);
  const [copyButtonText, setCopyButtonText] = useState('Copy link')
  const [userPresent, setUserPresent] = useState(true);
  const [newUserName, setNewUserName] = useState(generateUserName());
  const [users, setUsers] = useState([{
    userId: '',
    name: '',
    tiles: [],
    worms: 0
  }]);

  useEffect(() => {
    // set user flag url
    getFlagUrl()
      .then(res => setFlagURL(res));
  }, []);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = streamGame(gameId, snapshot => {
      const updatedUsers = snapshot.get('users');
      setUsers(updatedUsers);
      setUserPresent(updatedUsers.map(user => user.userId).includes(uid));
      const event = snapshot.get('event');
      if (event.type) setRedirect(`/game/${gameId}`);
      setLoading(false);
    });

    return unsubscribe;
  }, [gameId, uid]);

  const UserNameList = () => {
    const userNameList = users.map((user, index) =>
      <h3 key={index}>
        <img
          src={user.flag}
          alt='flag'
          height='13'
        />
        &nbsp;
        {user.name}
      </h3>);

    return (
      <div>
        <h4>Users present in this waiting room:</h4>
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

    addUserToGame(gameId, uid, newUserName, flagURL);
  }

  const EnterRoomForm = () => {
    return (
      <form onSubmit={handleSubmit}>
        <br />
        <label>
          Your Username:
          <br />
          <input
            type='text'
            value={newUserName}
            name='userName'
            onChange={handleChange}
          />
        </label>
        <br />
        <br />
        <button type='submit'>Ready</button>
      </form>
    )
  }

  function StartGame() {
    postEvent(gameId, 'startGame', {
      currPlayerIndex: getRandomIntIncl(0, users.length-1)
    });
    setRedirect(`/game/${gameId}`);
  }

  const StartGameButton = () => {
    return (
      <form>
        <button
          type='button'
          onClick={StartGame}
        >
          Everyone's in!
        </button>
      </form>
    )
  }

  const LinkSharing = () => {
    return (
      <div>
        <input
          type='text'
          value={window.location.href}
          ref={textInputRef}
          onFocus={(event) => event.target.select()}
          readOnly
          style={{
            marginTop: '5px',
            width: `${38 + gameId.length}ex`,
            height: '30px',
            boxSizing: 'border-box',
            textAlign: 'center',
            fontSize: '20px',
            color: 'maroon'
          }}
        />
        <button
          type='button'
          onClick={(event) => {
            textInputRef.current.select();
            // textInputRef.current.focus();
            document.execCommand('copy');
            event.target.focus();
            setCopyButtonText('Copied');
            setTimeout(() => setCopyButtonText('Copy link'), 500);
          }}
          style={{
            marginTop: '5px',
            width: '10ex',
            height: '30px',
            boxSizing: 'border-box',
            textAlign: 'center',
            fontSize: '20px'
          }}
        >
          {copyButtonText}
        </button>
      </div>
    )
  }

  if (redirect) return <Redirect push to={redirect} />;

  // return (
  //   <div className='flex-col'>
  //     <h1>Pickomino Online</h1>
  //     <br />
  //     <span>Share this link with your friends:</span>
  //     <input
  //       type='text'
  //       value={window.location.href}
  //       readOnly
  //       style={{
  //         marginTop: '5px',
  //         width: `${38 + gameId.length}ex`,
  //         height: '30px',
  //         boxSizing: 'border-box',
  //         textAlign: 'center',
  //         fontSize: '20px',
  //         color: 'maroon'
  //       }}
  //     />
  //     {loading ? (
  //       <h5>Loading user list...</h5>
  //     ) : (
  //       <div>
  //         <UserNameList />
  //         {userPresent ? <StartGameButton /> : <EnterRoomForm />}
  //       </div>
  //     )}
  //     <br />
  //     <br />
  //     <br />
  //     <br />
  //     <img
  //       style={{margin: 'auto'}}
  //       src={Logo}
  //       alt='worm'
  //     />
  //   </div>
  // )



  return (
    <div className='flex-col'>
      <h1>Pickomino Online</h1>
      <br />
      <span>Share this link with your friends:</span>
      <LinkSharing />
      {loading ? (
        <h5>Loading user list...</h5>
      ) : (
        <div>
          <UserNameList />
          {userPresent ? (
            <form>
              <button
                type='button'
                onClick={StartGame}
              >
                Everyone's in!
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <br />
              <label>
                Your Username:
                <br />
                <input
                  type='text'
                  value={newUserName}
                  name='userName'
                  onChange={handleChange}
                />
              </label>
              <br />
              <br />
              <button type='submit'>Ready</button>
            </form>
          )}
        </div>
      )}
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

export default RoomPage