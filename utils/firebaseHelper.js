import { initializeApp } from "firebase/app";

export const getFirebaseApp = () => {
  const firebaseConfig = {
    apiKey: "AIzaSyA8gyPEWb8ttDk_qysGJHr02Iw5omZlwd8",
    authDomain: "whatsapp-5db75.firebaseapp.com",
    projectId: "whatsapp-5db75",
    storageBucket: "whatsapp-5db75.appspot.com",
    messagingSenderId: "1080837374587",
    appId: "1:1080837374587:web:b79e8655dbe3379a8258de",
    measurementId: "G-9YM3G52J56",
  };

  // Initialize Firebase
  return initializeApp(firebaseConfig);
};
