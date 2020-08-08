import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

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
    event: {
      type: null,
      data: null
    }
  });
};

export const addUserToGame = (gameId, userId, userName, flagURL) => {
  return db.collection('games').doc(gameId).update({
    users: firebase.firestore.FieldValue.arrayUnion(
      { 
        userId: userId,
        name: userName,
        flag: flagURL
      }
    )
  });
};

export const getGame = gameId => {
  return db.collection('games').doc(gameId).get();
};

export const streamGame = (gameId, observer) => {
  return db.collection('games').doc(gameId).onSnapshot(observer);
};

export const postEvent = (gameId, type, data) => {
  return db.collection('games').doc(gameId).update({
    'event.type': type,
    'event.data': data
  });
};

export default firebase;
