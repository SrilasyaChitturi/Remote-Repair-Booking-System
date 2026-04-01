// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "YOUR KEY",
  authDomain: "remote-repair-be03c.firebaseapp.com",
  projectId: "remote-repair-be03c",
  storageBucket: "remote-repair-be03c.firebasestorage.app",
  messagingSenderId: "809107688574",
  appId: "1:809107688574:web:b650d64d27726f4aa15c2f",
  measurementId: "G-L8HG2GY6GH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

