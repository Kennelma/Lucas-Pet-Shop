// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcI0iNFfEshLy3Xsdkel62AQyVCnNc36M",
  authDomain: "lucas-pet-shop.firebaseapp.com",
  projectId: "lucas-pet-shop",
  storageBucket: "lucas-pet-shop.firebasestorage.app",
  messagingSenderId: "390703409077",
  appId: "1:390703409077:web:d96bfee7e4104d5b42dbfc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);