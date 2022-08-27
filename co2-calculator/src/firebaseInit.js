import firebase from "firebase/app"
import "firebase/database"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAydg6STXWW9UB39RnhzEOEirN9l9jy3mc",
  authDomain: "dianaproject-187b3.firebaseapp.com",
  databaseURL: "https://dianaproject-187b3-default-rtdb.firebaseio.com",
  projectId: "dianaproject-187b3",
  storageBucket: "dianaproject-187b3.appspot.com",
  messagingSenderId: "740027423286",
  appId: "1:740027423286:web:da1e69e4c02b1d00d41697",
  measurementId: "G-G39RL37747",
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)
export default firebase.database()
