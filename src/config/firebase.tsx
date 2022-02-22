// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCjTHuF_RNDa-GBSHT8KTdHtlZWWTKlWcM',
  authDomain: 'social-app-f54c7.firebaseapp.com',
  projectId: 'social-app-f54c7',
  storageBucket: 'social-app-f54c7.appspot.com',
  messagingSenderId: '763329648341',
  appId: '1:763329648341:web:7944ac50ddbb423e60b45c',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const storage = getStorage(app);
