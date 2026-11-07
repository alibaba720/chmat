import { auth, db, authReady } from './firebase-config.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { doc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// 1. Wait karein ke session ready ho jaye, phir check karein
authReady.then(() => {
    onAuthStateChanged(auth, (user) => {
        if (user && !isSigningUp) {
            window.location.href = "app.html";
        }
    });
});

let isSigningUp = false;
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const toggleBtn = document.getElementById('toggleBtn');
const toggleText = document.getElementById('toggleText');

toggleBtn.addEventListener('click', () => {
  if (loginForm.classList.contains('hidden')) {
    loginForm.classList.remove('hidden'); registerForm.classList.add('hidden');
    toggleText.innerText = "Don't have an account?"; toggleBtn.innerText = "Sign up";
  } else {
    loginForm.classList.add('hidden'); registerForm.classList.remove('hidden');
    toggleText.innerText = "Already have an account?"; toggleBtn.innerText = "Log in";
  }
});

document.getElementById('loginBtn').addEventListener('click', async () => {
  const identifier = document.getElementById('loginIdentifier').value.trim();
  const password = document.getElementById('loginPassword').value;
  const btn = document.getElementById('loginBtn');

  if (!identifier || !password) { alert("Please enter details!"); return; }
  btn.innerText = "Logging in...";
  let loginEmail = "";

  try {
    if (/^\d+$/.test(identifier)) {
      loginEmail = identifier + "@chmat.com"; 
    } else {
      const q = query(collection(db, "users"), where("username", "==", identifier.toLowerCase()));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) { alert("Username not found!"); btn.innerText = "Log In"; return; }
      loginEmail = querySnapshot.docs[0].data().mobile + "@chmat.com"; 
    }
    await signInWithEmailAndPassword(auth, loginEmail, password);
    window.location.href = "app.html";
  } catch (error) {
    alert("Login Failed! Check details."); 
    btn.innerText = "Log In";
  }
});

document.getElementById('registerBtn').addEventListener('click', async () => {
  const mobile = document.getElementById('regMobile').value.trim();
  const username = document.getElementById('regUsername').value.trim().toLowerCase();
  const realEmail = document.getElementById('regEmail').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value;
  const gender = document.getElementById('regGender').value;
  const q1 = document.getElementById('regQuestion1').value;
  const a1 = document.getElementById('regAnswer1').value.trim().toLowerCase();
  const q2 = document.getElementById('regQuestion2').value;
  const a2 = document.getElementById('regAnswer2').value.trim().toLowerCase();

  if (!mobile || !username || !realEmail || !password || !gender || !q1 || !a1 || !q2 || !a2) { alert("Please fill all fields, including Gender!"); return; }

  const btn = document.getElementById('registerBtn');
  btn.innerText = "Checking..."; btn.disabled = true;

  try {
    const qMobile = query(collection(db, "users"), where("mobile", "==", mobile));
    const qUser = query(collection(db, "users"), where("username", "==", username));
    if (!(await getDocs(qMobile)).empty) { alert("Mobile already registered!"); btn.innerText = "Sign Up"; btn.disabled = false; return; }
    if (!(await getDocs(qUser)).empty) { alert("Username already taken!"); btn.innerText = "Sign Up"; btn.disabled = false; return; }

    btn.innerText = "Signing up...";
    const authEmail = mobile + "@chmat.com"; 
    isSigningUp = true;
    const userCredential = await createUserWithEmailAndPassword(auth, authEmail, password);
    const user = userCredential.user;

    
    const availableThemes = ['iron_man', 'thor', 'spiderman', 'captain_america', 'doctor_strange', 'hulk', 'black_widow', 'hawkeye', 'thanos', 'venom', 'loki'];
    const randomTheme = availableThemes[Math.floor(Math.random() * availableThemes.length)];
    localStorage.setItem('chmat_active_theme', randomTheme);

    await setDoc(doc(db, "users", user.uid), {
      assignedTheme: randomTheme,
      uid: user.uid, mobile: mobile, username: username, email: realEmail,
      displayName: username, friends: [], bio: "Hello, I am using CHMAT!", gender: gender, 
      security: { q1, a1, q2, a2 }, createdAt: new Date()
    });

    alert("Account created successfully!");
    window.location.href = "onboarding.html";

  } catch (error) {
    alert("Registration Error: " + error.message); btn.innerText = "Sign Up"; btn.disabled = false;
  }
});
