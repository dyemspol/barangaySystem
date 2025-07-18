// src/firebase.config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  serverTimestamp,
  get,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB9KdVhCfwfNSJ-jAMlDYMimmCA-3uNmrA",
  authDomain: "barangay-canidkid.firebaseapp.com",
  databaseURL: "https://barangay-canidkid-default-rtdb.firebaseio.com",
  projectId: "barangay-canidkid",
  storageBucket: "barangay-canidkid.appspot.com", // ✅ corrected
  messagingSenderId: "781484692625",
  appId: "1:781484692625:web:241a31ddc0039b29561b30",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, push, set, serverTimestamp, get };
