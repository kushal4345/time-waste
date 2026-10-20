// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, set, onDisconnect, serverTimestamp, off, remove, onChildAdded, update } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCNzu5b_YeEZgOqSXx9qeJqSOUFAsJ3tsk",
  authDomain: "chatttt-43322.firebaseapp.com",
  databaseURL: "https://chatttt-43322-default-rtdb.firebaseio.com",
  projectId: "chatttt-43322",
  storageBucket: "chatttt-43322.firebasestorage.app",
  messagingSenderId: "316086005259",
  appId: "1:316086005259:web:747c2c4fe76710ba5de10e",
  measurementId: "G-TGRG9V9TPS"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, push, onValue, set, onDisconnect, serverTimestamp, off, remove, onChildAdded, update };
