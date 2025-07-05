import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAxx438jjSCS27mm1Aa09kgYivgIF3-QAo",
  authDomain: "communication-c97af.firebaseapp.com",
  projectId: "communication-c97af",
  storageBucket: "communication-c97af.appspot.com",
  messagingSenderId: "291478175469",
  appId: "1:291478175469:web:ad044e147103248f57d6e4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };