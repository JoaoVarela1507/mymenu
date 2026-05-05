import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyC1fh0fw0NDjlqrAZrIoOxZnfYl0Q7oTRA',
  authDomain: 'mymenu-c3cdc.firebaseapp.com',
  databaseURL: 'https://mymenu-c3cdc-default-rtdb.firebaseio.com',
  projectId: 'mymenu-c3cdc',
  storageBucket: 'mymenu-c3cdc.firebasestorage.app',
  messagingSenderId: '754560035452',
  appId: '1:754560035452:web:3bb835a6057129b64d77f9',
  measurementId: 'G-LJ6R22Z9GN',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
