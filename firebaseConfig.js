import firebase from 'firebase/app'; // Import the core app module
import {initializeApp} from '@react-native-firebase/app';
import 'firebase/auth'; // Import other modules as needed
import 'firebase/firestore'; // Import Firestore
import 'firebase/storage'; // Import storage module (if used)
import {getAuth} from '@react-native-firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDvhPDEx-UKBUdrsNkqOPdjoAjoFUsGruU',
  authDomain: 'wallpemsg.firebaseapp.com',
  projectId: 'wallpemsg',
  storageBucket: 'wallpemsg.firebasestorage.app',
  messagingSenderId: '686723359931',
  appId: '1:686723359931:web:d67e5fc3204fa5c1e7759e',
  measurementId: 'G-9EPRCQ5XPM',
};

// Initialize Firebase *only if not already initialized*
if (!firebase?.apps?.length) {
  // The correct check
  initializeApp(firebaseConfig);
}

const auth = firebase.auth(); // Get auth instance *after* initialization
const db = firebase.firestore(); // Get db instance *after* initialization
const storage = firebase.storage(); // Get storage instance *after* initialization

export {auth, db, storage}; // Export the instances
