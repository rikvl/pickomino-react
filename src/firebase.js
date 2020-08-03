import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { tileValuesAll, getWormValue } from './utils';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

export const createGame = (gameId, userId, userName) => {
  return db.collection('games').doc(gameId).set({
    created: firebase.firestore.FieldValue.serverTimestamp(),
    createdBy: userId,
    users: [{
      userId: userId,
      name: userName,
      tiles: [],
      worms: 0
    }],
    gameData: {
      tilesTable: tileValuesAll,
      stealableTiles: [],
      nDiceLeft: 8,
      diceRolled: [],
      diceSavedVals: [],
      justRolledDice: false,
      justPickedDice: false,
      canPickDice: false,
      canPickTile: false,
      score: 0,
      winnerIndex: -1,
      currPlayerIndex: null,
      currPlayerUid: null
    }
  });
};

export const addUserToGame = (gameId, userId, userName) => {
  return db.collection('games').doc(gameId).update({
    users: firebase.firestore.FieldValue.arrayUnion(
      { 
        userId: userId,
        name: userName,
        tiles: [],
        worms: 0
      }
    )
  });
};

export const updateGameData = (gameId, key, value) => {
  return db.collection('games').doc(gameId).update({
    [`gameData.${key}`]: value
  });
};

export const addUserTile = (gameId, users, userIndex, value) => {
  const updatedUsers = users.map((user, index) =>
    index === userIndex ?
    { ...user,
      tiles: [...user.tiles, value],
      worms: user.worms + getWormValue(value)
    } :
    user
  );

  return db.collection('games').doc(gameId).update({
    users: updatedUsers
  });
};

export const removeUserTile = (gameId, users, userIndex, value) => {
  const updatedUsers = users.map((user, index) =>
    index === userIndex ?
    { ...user,
      tiles: user.tiles.slice(0, -1),
      worms: user.worms - getWormValue(value)
    } :
    user
  );

  console.log(users, updatedUsers, userIndex, value);

  return db.collection('games').doc(gameId).update({
    users: updatedUsers
  });
};

export const transferUserTile = (gameId, users, stealer, victim, value) => {
  const updatedUsers = users.map((user, index) => {
    if (index === stealer)
      return { ...user,
        tiles: [...user.tiles, value],
        worms: user.worms + getWormValue(value)
      }
    else if (index === victim)
      return { ...user,
        tiles: user.tiles.slice(0, -1),
        worms: user.worms - getWormValue(value)
      }
    else
      return user
    });

  return db.collection('games').doc(gameId).update({
    users: updatedUsers
  });
}

export const resetUsers = (gameId, users) => {
  const updatedUsers = users.map(user => {
    return {
      ...user,
      tiles: [],
      worms: 0
    }}
  );

  return db.collection('games').doc(gameId).update({
    users: updatedUsers
  });
};

export const getGame = gameId => {
  return db.collection('games').doc(gameId).get();
};

export const streamGame = (gameId, observer) => {
  return db.collection('games').doc(gameId).onSnapshot(observer);
};

export default firebase;
