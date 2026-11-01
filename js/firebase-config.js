import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1L4rPK5DQWLhLKh1CowN5zZFRafElhAM",
  authDomain: "chmat-app-af6e1.firebaseapp.com",
  projectId: "chmat-app-af6e1",
  storageBucket: "chmat-app-af6e1.firebasestorage.app",
  messagingSenderId: "478230235170",
  appId: "1:478230235170:web:75fee319b9f29af07b227b"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Ye line session ko phone/browser ki memory mein force save karti hai
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Session Persistence Error:", error);
});
