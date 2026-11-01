import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { doc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

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

document.getElementById('registerBtn').addEventListener('click', async () => {
  const mobile = document.getElementById('regMobile').value.trim();
  const username = document.getElementById('regUsername').value.trim().toLowerCase();
  const realEmail = document.getElementById('regEmail').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value;
  const q1 = document.getElementById('regQuestion1').value;
  const a1 = document.getElementById('regAnswer1').value.trim().toLowerCase();
  const q2 = document.getElementById('regQuestion2').value;
  const a2 = document.getElementById('regAnswer2').value.trim().toLowerCase();

  if (!mobile || !username || !realEmail || !password || !q1 || !a1 || !q2 || !a2) {
    alert("Please fill all fields!"); return;
  }
  if (password.length < 6) { alert("Password must be at least 6 characters."); return; }

  const btn = document.getElementById('registerBtn');
  btn.innerText = "Checking..."; btn.disabled = true;

  try {
    const qMobile = query(collection(db, "users"), where("mobile", "==", mobile));
    const qUser = query(collection(db, "users"), where("username", "==", username));
    if (!(await getDocs(qMobile)).empty) { alert("Mobile already registered!"); btn.innerText = "Sign Up"; btn.disabled = false; return; }
    if (!(await getDocs(qUser)).empty) { alert("Username already taken!"); btn.innerText = "Sign Up"; btn.disabled = false; return; }

    btn.innerText = "Signing up...";

    const authEmail = mobile + "@chmat.com"; // Mobile Number as Email
    const userCredential = await createUserWithEmailAndPassword(auth, authEmail, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid, mobile: mobile, username: username, email: realEmail, 
      security: { q1, a1, q2, a2 }, createdAt: new Date()
    });

    alert("Account created successfully!");
    window.location.href = "app.html";

  } catch (error) {
    alert("Registration Error: " + error.message); btn.innerText = "Sign Up"; btn.disabled = false;
  }
});

document.getElementById('loginBtn').addEventListener('click', async () => {
  const identifier = document.getElementById('loginIdentifier').value.trim();
  const password = document.getElementById('loginPassword').value;
  const btn = document.getElementById('loginBtn');

  if (!identifier || !password) { alert("Enter details!"); return; }
  btn.innerText = "Logging in...";
  let loginEmail = "";

  try {
    if (/^\d+$/.test(identifier)) {
      loginEmail = identifier + "@chmat.com"; // Mobile Number Login
    } else {
      const q = query(collection(db, "users"), where("username", "==", identifier.toLowerCase()));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) { alert("Username not found!"); btn.innerText = "Log In"; return; }
      loginEmail = querySnapshot.docs[0].data().mobile + "@chmat.com"; // Username to Mobile -> Email
    }

    await signInWithEmailAndPassword(auth, loginEmail, password);
    window.location.href = "app.html";

  } catch (error) {
    alert("Login Failed! Check your details or password."); btn.innerText = "Log In";
  }
});
