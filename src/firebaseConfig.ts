import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC2lwLrobcbRebd0d9xJbFBj6jDKTH7Z7w",
  authDomain: "app-financas-84f81.firebaseapp.com",
  projectId: "app-financas-84f81",
  storageBucket: "app-financas-84f81.firebasestorage.app",
  messagingSenderId: "704237768880",
  appId: "1:704237768880:web:c9201fa93bcdafa1826b75"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);