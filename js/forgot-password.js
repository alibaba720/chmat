import { auth, db } from './firebase-config.js';
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

document.getElementById('findAccountBtn').addEventListener('click', async () => {
  const identifier = document.getElementById('resetIdentifier').value.trim();
  const btn = document.getElementById('findAccountBtn');
  if (!identifier) { alert("Enter Username or Mobile"); return; }

  btn.innerText = "Searching..."; btn.disabled = true;
  let realEmail = "";

  try {
    let q;
    if (/^\d+$/.test(identifier)) {
      q = query(collection(db, "users"), where("mobile", "==", identifier));
    } else {
      q = query(collection(db, "users"), where("username", "==", identifier.toLowerCase()));
    }
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) { alert("Account not found!"); btn.innerText = "Find Account"; btn.disabled = false; return; }
    
    realEmail = querySnapshot.docs[0].data().email;

    await sendPasswordResetEmail(auth, realEmail);
    alert(`Password reset link sent to your real email: ${realEmail}`);
    window.location.href = "login.html";

  } catch (error) {
    alert("Error: " + error.message); btn.innerText = "Find Account"; btn.disabled = false;
  }
});
