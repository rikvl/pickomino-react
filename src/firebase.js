import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { tileValsAll } from './utils/GameUtils';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

export const createGame = (gameId) => {
  return db.collection('games').doc(gameId).set({
    created: firebase.firestore.FieldValue.serverTimestamp(),
    users: [],
    data: {
      status: 'waiting',
      players: [],
      currPlayerIndex: null,
      currUid: null,
      winnerIndex: -1,
      nDiceLeft: 8,
      diceRolled: [],
      diceSavedVals: [],
      score: 0,
      tilesTable: tileValsAll,
      stealableTiles: [],
      justRolledDice: false,
      justPickedDice: false
    }
  });
};

export const addUserToGame = async (gameId, userId, userName) => {

  const game = await getGame(gameId);
  const gameData = game.get('data');

  const updatedPlayers = gameData.players;
  updatedPlayers.push({
    userId: userId,
    name: userName,
    tiles: []
  });

  updateGame(gameId, {
    ...gameData,
    players: updatedPlayers
  });
};

export const getGame = gameId => {
  return db.collection('games').doc(gameId).get();
};

export const streamGame = (gameId, observer) => {
  return db.collection('games').doc(gameId).onSnapshot(observer);
};

export const updateGame = (gameId, data) => {
  return db.collection('games').doc(gameId).update({
    'data': data
  });
};

export default firebase;
