import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, updatePassword, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

let currentUser = null;

// Get Elements
const backBtn = document.getElementById('backBtn');
const pageTitle = document.getElementById('pageTitle');
const mainMenu = document.getElementById('mainMenu');
const accountSection = document.getElementById('accountSection');
const securitySection = document.getElementById('securitySection');

// Navigation Functions
document.getElementById('menuAccount').addEventListener('click', () => {
    mainMenu.classList.add('hidden');
    accountSection.classList.remove('hidden');
    pageTitle.innerText = "Account";
});

document.getElementById('menuSecurity').addEventListener('click', () => {
    mainMenu.classList.add('hidden');
    securitySection.classList.remove('hidden');
    pageTitle.innerText = "Security";
});

document.getElementById('menuLogout').addEventListener('click', () => {
    signOut(auth).then(() => window.location.href = 'login.html');
});

backBtn.addEventListener('click', () => {
    if (!accountSection.classList.contains('hidden') || !securitySection.classList.contains('hidden')) {
        accountSection.classList.add('hidden');
        securitySection.classList.add('hidden');
        mainMenu.classList.remove('hidden');
        pageTitle.innerText = "Settings";
    } else {
        window.location.href = 'app.html';
    }
});

// Load Data on Auth State Change
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    const docSnap = await getDoc(doc(db, "users", user.uid));
    if (docSnap.exists()) {
      const data = docSnap.data();
      document.getElementById('setUsername').value = data.username || "";
      document.getElementById('setMobile1').value = data.mobile || "";
      document.getElementById('setMobile2').value = data.mobile2 || "";
      document.getElementById('setEmail1').value = data.email || "";
      document.getElementById('setEmail2').value = data.email2 || "";
    }
  } else { 
      window.location.href = 'login.html'; 
  }
});

// Save Details
document.getElementById('saveDetailsBtn').addEventListener('click', async () => {
  if (!currentUser) return;
  const mobile1 = document.getElementById('setMobile1').value.trim();
  const mobile2 = document.getElementById('setMobile2').value.trim();
  const email1 = document.getElementById('setEmail1').value.trim();
  const email2 = document.getElementById('setEmail2').value.trim();

  if (!mobile1 || !email1) { alert("Primary Mobile and Email required!"); return; }

  const btn = document.getElementById('saveDetailsBtn');
  btn.innerText = "Saving...";
  try {
    await updateDoc(doc(db, "users", currentUser.uid), { mobile: mobile1, mobile2, email: email1, email2 });
    alert("Details updated successfully!");
  } catch (error) { alert("Error: " + error.message); }
  btn.innerText = "Save Details";
});

// Change Password
document.getElementById('changePasswordBtn').addEventListener('click', async () => {
  if (!currentUser) return;
  const newPassword = document.getElementById('newPassword').value;
  if (newPassword.length < 6) { alert("Password must be at least 6 characters."); return; }

  const btn = document.getElementById('changePasswordBtn');
  btn.innerText = "Updating...";
  try {
    await updatePassword(currentUser, newPassword);
    alert("Password updated successfully!");
    document.getElementById('newPassword').value = "";
  } catch (error) {
    if (error.code === 'auth/requires-recent-login') {
      alert("Security: Please logout and login again to change password.");
    } else { alert("Error: " + error.message); }
  }
  btn.innerText = "Update Password";
});
