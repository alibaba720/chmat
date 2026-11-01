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

// Ye Promise ensure karega ke session save hone ke baad hi aage ka code chale
export const authReady = setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Session Persistence Set to LOCAL");
    return true;
  })
  .catch((error) => {
    console.error("Persistence Error:", error);
    return false;
  });
