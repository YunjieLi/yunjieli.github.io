// src/firebase.js
import firebase from 'firebase'
const config = {
  apiKey: "AIzaSyBEbnRpTwZGAXjapdyCVfyOSMzOKrGP85k",
  authDomain: "a-phrasebook.firebaseapp.com",
  databaseURL: "https://a-phrasebook.firebaseio.com",
  projectId: "a-phrasebook",
  storageBucket: "",
  messagingSenderId: "782523501103"
};
firebase.initializeApp(config);
export default firebase;