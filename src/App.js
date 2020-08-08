import React, { useState, useEffect } from 'react';
import './App.css';

import { BrowserRouter, Switch, Route } from 'react-router-dom';

import { UserContext } from './context';

import firebase from './firebase';

import HomePage from './pages/HomePage';
import RoomPage from './pages/RoomPage';
import GamePage from './pages/GamePage';

function App() {

  const [uid, setUid] = useState(null);

  useEffect(() => {
    return firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        setUid(user.uid);
      } else {
        // User is signed out.
        setUid(null);
        firebase
          .auth()
          .signInAnonymously()
          .catch((error) => {
            console.log(error);
            alert("Unable to connect to the server. Please try again later.");
          });
      }
    });
  }, []);

  return (
    <BrowserRouter>
      {!uid ? (
        <h1>Loading...</h1>
      ) : (
        <UserContext.Provider value={uid}>
          <Switch>
            <Route exact path='/' component={HomePage} />
            <Route exact path='/room/:id' component={RoomPage} />
            <Route exact path='/game/:id' component={GamePage} />
          </Switch>
        </UserContext.Provider>
      )}
    </BrowserRouter>
  );
}

export default App;
