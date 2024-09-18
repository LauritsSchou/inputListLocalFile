import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCcXmaytYGQfgi42m4ogqH5_T5ZoK-8pIs",
  authDomain: "bucketlistapp-f5d9c.firebaseapp.com",
  projectId: "bucketlistapp-f5d9c",
  storageBucket: "bucketlistapp-f5d9c.appspot.com",
  messagingSenderId: "572173746683",
  appId: "1:572173746683:web:41fbef37668b914d61cb5e",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

export { db };
