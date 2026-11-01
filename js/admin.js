import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { collection, getDocs, doc, updateDoc, query, where, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const OWNER_MOBILE = "03016631720"; 
let currentUser = null;
let currentUserData = null;
let myRole = "user";
let myRoleLevel = 0; 
// Levels: user=1, mod=2, admin=3, coowner=4, owner=5

// Tab Switching
document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    tab.classList.add('active');
    document.getElementById(tab.getAttribute('data-tab') + 'Tab').classList.remove('hidden');
  });
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    const docSnap = await getDocs(query(collection(db, "users"), where("uid", "==", user.uid)));
    if (!docSnap.empty) {
      currentUserData = docSnap.docs[0].data();
      const cleanMobile = currentUserData.mobile ? String(currentUserData.mobile).replace(/[^0-9]/g, '') : "";
      
      if (cleanMobile === OWNER_MOBILE) {
        myRole = "owner"; myRoleLevel = 5;
      } else {
        myRole = currentUserData.role || "user";
        if (myRole === 'coowner') myRoleLevel = 4;
        else if (myRole === 'admin') myRoleLevel = 3;
        else if (myRole === 'mod') myRoleLevel = 2;
        else myRoleLevel = 1;
      }

      // Hide Tabs based on role
      if (myRole !== 'owner') {
        document.querySelector('.admin-tab[data-tab="badges"]').style.display = 'none';
        document.getElementById('bansTabBtn').style.display = 'none';
      }
      
      if (myRoleLevel < 2) {
        window.location.href = 'app.html'; // Normal user cannot access
      }

      loadMembers();
      loadReports();
      if (myRole === 'owner') loadBans();
    }
  } else { window.location.href = 'login.html'; }
});

// --- MEMBERS TAB ---
async function loadMembers() {
  const membersList = document.getElementById('membersList');
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    let html = '';
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const userId = docSnap.id;
      
      const targetMobile = data.mobile ? String(data.mobile).replace(/[^0-9]/g, '') : "";
      const isTargetOwner = targetMobile === OWNER_MOBILE;
      
      let targetRole = isTargetOwner ? "owner" : (data.role || "user");
      let targetLevel = 1;
      if(targetRole === 'owner') targetLevel = 5;
      else if(targetRole === 'coowner') targetLevel = 4;
      else if(targetRole === 'admin') targetLevel = 3;
      else if(targetRole === 'mod') targetLevel = 2;

      // Only show mobile to Owner
      let mobileDisplay = myRole === 'owner' ? `| ${data.mobile || 'No Mobile'}` : ``;

      // Role Dropdown Logic (Hierarchy)
      let roleHtml = '';
      if (isTargetOwner) {
        roleHtml = `<div style="background: #ffd700; color: #000; padding: 6px 12px; border-radius: 6px; font-weight: bold; font-size: 12px;">👑 Owner</div>`;
      } else if (myRoleLevel > targetLevel) {
        // Can change role
        roleHtml = `
          <select class="role-select" onchange="updateRole('${userId}', this.value)">
            <option value="user" ${targetRole === 'user' ? 'selected' : ''}>User</option>
            <option value="mod" ${targetRole === 'mod' ? 'selected' : ''}>Moderator</option>
            <option value="admin" ${targetRole === 'admin' ? 'selected' : ''}>Admin</option>
            <option value="coowner" ${targetRole === 'coowner' ? 'selected' : ''}>Co-Owner</option>
          </select>
        `;
      } else {
        // Cannot change role
        roleHtml = `<div style="color:#888; font-size:12px;">${targetRole.toUpperCase()}</div>`;
      }

      // Ban Button (If Target is not Owner and Current user has higher power)
      let banBtn = '';
      if (!isTargetOwner && myRoleLevel > targetLevel && !data.isBanned) {
          banBtn = `<button onclick="banUser('${userId}', '${data.username}')" style="background:#ff3b30; color:#fff; border:none; padding:6px 10px; border-radius:6px; font-size:12px; margin-left:10px; cursor:pointer;">Ban</button>`;
      } else if (data.isBanned) {
          banBtn = `<span style="color:#ff3b30; font-size:12px; font-weight:bold; margin-left:10px;">BANNED</span>`;
      }

      html += `
        <div class="user-card" style="flex-wrap: wrap; gap: 10px;">
          <div class="user-card-info" style="flex:1; min-width:150px;">
            <h3>${data.displayName || data.username} ${isTargetOwner ? '👑' : ''}</h3>
            <p>@${data.username} ${mobileDisplay}</p>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            ${roleHtml}
            ${banBtn}
          </div>
        </div>
      `;
    });
    membersList.innerHTML = html;
  } catch (error) { membersList.innerHTML = `<p style="color:red; text-align:center;">Error: ${error.message}</p>`; }
}

window.updateRole = async function(userId, newRole) {
  try { 
    await updateDoc(doc(db, "users", userId), { role: newRole }); 
    alert("Role updated successfully!"); 
    loadMembers();
  } catch (error) { alert("Error: " + error.message); }
};

// --- BAN & UNBAN LOGIC ---
window.banUser = async function(userId, username) {
  const reasons = "1. Misbehavior\n2. Abusing / Harassment\n3. Spamming\n4. Adult Content\n5. Fake Account";
  let reasonChoice = prompt(`Ban @${username}\nChoose Reason (Type 1-5):\n${reasons}`);
  if(!reasonChoice) return;

  let reasonText = "";
  if(reasonChoice === '1') reasonText = "Misbehavior";
  else if(reasonChoice === '2') reasonText = "Abusing / Harassment";
  else if(reasonChoice === '3') reasonText = "Spamming";
  else if(reasonChoice === '4') reasonText = "Adult Content";
  else if(reasonChoice === '5') reasonText = "Fake Account";
  else { alert("Invalid reason choice."); return; }

  try {
    await updateDoc(doc(db, "users", userId), { 
      isBanned: true, 
      banReason: reasonText,
      bannedBy: currentUserData.username,
      bannedAt: serverTimestamp()
    });

    // Log to owner (using a simple notification collection)
    const ownerQ = query(collection(db, "users"), where("mobile", "==", OWNER_MOBILE));
    const ownerSnap = await getDocs(ownerQ);
    if(!ownerSnap.empty) {
        const ownerId = ownerSnap.docs[0].id;
        await addDoc(collection(db, "notifications"), {
            receiverId: ownerId,
            title: "User Banned",
            message: `@${currentUserData.username} banned @${username} for ${reasonText}.`,
            createdAt: serverTimestamp(),
            read: false
        });
    }
    alert("User has been banned.");
    loadMembers();
  } catch (error) { alert("Error: " + error.message); }
};

async function loadBans() {
    const bansList = document.getElementById('bansList');
    try {
        const q = query(collection(db, "users"), where("isBanned", "==", true));
        const snapshot = await getDocs(q);
        if(snapshot.empty) {
            bansList.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px;">No banned users.</p>';
            return;
        }
        let html = '';
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            html += `
              <div class="user-card" style="flex-direction:column; align-items:flex-start; gap:10px;">
                <div class="user-card-info">
                  <h3>@${data.username}</h3>
                  <p style="color:#ff3b30; font-size:12px;">Reason: ${data.banReason}</p>
                  <p style="font-size:11px; color:#888;">Banned by: @${data.bannedBy}</p>
                </div>
                <button onclick="unbanUser('${docSnap.id}')" style="background:#0095f6; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:bold;">Unban User</button>
              </div>
            `;
        });
        bansList.innerHTML = html;
    } catch(e) { bansList.innerHTML = `<p style="color:red;">Error: ${e.message}</p>`; }
}

window.unbanUser = async function(userId) {
    try {
        await updateDoc(doc(db, "users", userId), { isBanned: false, banReason: null, bannedBy: null });
        alert("User unbanned successfully!");
        loadBans();
        loadMembers();
    } catch(e) { alert("Error: " + e.message); }
};

// --- REPORTS TAB ---
async function loadReports() {
  const reportsTab = document.getElementById('reportsTab');
  try {
    const q = query(collection(db, "reports"), where("status", "==", "pending"));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      reportsTab.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px;">No pending reports.</p>';
      return;
    }

    let html = '';
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const reportId = docSnap.id;
      
      html += `
        <div class="user-card" style="flex-direction: column; align-items: flex-start; gap: 10px;">
          <div class="user-card-info">
            <h3>${data.type === 'profile' ? '👤 Profile Report' : '📝 Post Report'}</h3>
            <p style="color: #ff3b30; font-weight: bold; margin: 4px 0;">Reason: ${data.reason}</p>
            <p style="font-size: 12px; color: #888;">Target ID: ${data.targetId.substring(0,8)}...</p>
          </div>
          <div style="display: flex; gap: 8px; width: 100%;">
            <button onclick="banUser('${data.targetId}', 'reported_user')" style="flex:1; background: #ff3b30; color: #fff; border:none; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: bold;">Ban User</button>
            <button onclick="resolveReport('${reportId}')" style="flex:1; background: #333; color: #fff; border:none; padding: 8px; border-radius: 6px; cursor: pointer;">Dismiss</button>
          </div>
        </div>
      `;
    });
    reportsTab.innerHTML = html;
  } catch (error) { reportsTab.innerHTML = `<p style="color:red; text-align:center;">Error loading reports: ${error.message}</p>`; }
}

window.resolveReport = async function(reportId) {
  try {
    await updateDoc(doc(db, "reports", reportId), { status: "resolved" });
    loadReports(); 
  } catch (error) { alert("Error: " + error.message); }
};

// --- BADGES TAB ---
const badgeSearchInput = document.getElementById('badgeSearchInput');
if (badgeSearchInput) {
  badgeSearchInput.addEventListener('input', async (e) => {
    const term = e.target.value.trim().toLowerCase();
    const resultsDiv = document.getElementById('badgeSearchResults');
    if (term.length < 2) { resultsDiv.innerHTML = '<p style="text-align:center; color:#888;">Type at least 2 letters...</p>'; return; }
    
    resultsDiv.innerHTML = '<p style="text-align:center; color:#888;">Searching...</p>';
    try {
      const q = query(collection(db, "users"), where("username", ">=", term), where("username", "<=", term + '\uf8ff'));
      const snapshot = await getDocs(q);
      if (snapshot.empty) { resultsDiv.innerHTML = '<p style="text-align:center; color:#888;">No user found.</p>'; return; }
      
      let html = '';
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const userId = docSnap.id;
        html += `
          <div class="user-card" style="flex-direction: column; align-items: flex-start; gap: 10px;">
            <div class="user-card-info"><h3>${data.displayName || data.username}</h3><p>@${data.username}</p></div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button onclick="setBadge('${userId}', 'gold')" style="background: #ffd700; color: #000; border:none; padding: 6px 10px; border-radius: 6px; font-weight: bold;">👑 Gold</button>
              <button onclick="setBadge('${userId}', 'blue')" style="background: #0095f6; color: #fff; border:none; padding: 6px 10px; border-radius: 6px; font-weight: bold;">🟦 Blue</button>
              <button onclick="setBadge('${userId}', 'none')" style="background: #333; color: #fff; border:none; padding: 6px 10px; border-radius: 6px;">Remove</button>
            </div>
          </div>
        `;
      });
      resultsDiv.innerHTML = html;
    } catch (error) { resultsDiv.innerHTML = `<p style="color:red; text-align:center;">Error: ${error.message}</p>`; }
  });
}

window.setBadge = async function(userId, badgeType) {
  try { await updateDoc(doc(db, "users", userId), { badge: badgeType === 'none' ? null : badgeType }); alert("Badge updated!"); } catch (error) { alert("Error: " + error.message); }
};

// --- APPEALS TAB ---
async function loadAppeals() {
    const appealsList = document.getElementById('appealsList');
    if(!appealsList) return;
    try {
        const q = query(collection(db, "appeals"), where("status", "==", "pending"));
        const snapshot = await getDocs(q);
        
        if(snapshot.empty) {
            appealsList.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px;">No pending appeals.</p>';
            return;
        }
        
        let html = '';
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            html += `
              <div class="user-card" style="flex-direction:column; align-items:flex-start; gap:10px;">
                <div class="user-card-info">
                  <h3>@${data.username}</h3>
                  <p style="color:#aaa; font-size:12px; margin-top:4px;">"${data.message}"</p>
                </div>
                <button onclick="handleAppeal('${docSnap.id}', '${data.uid}')" style="background:#0095f6; color:#fff; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; font-weight:bold;">Unban User</button>
              </div>
            `;
        });
        appealsList.innerHTML = html;
    } catch(e) { appealsList.innerHTML = `<p style="color:red;">Error: ${e.message}</p>`; }
}

window.handleAppeal = async function(appealId, userId) {
    try {
        await updateDoc(doc(db, "users", userId), { isBanned: false, banReason: null, bannedBy: null });
        await updateDoc(doc(db, "appeals", appealId), { status: "resolved" });
        alert("User unbanned and appeal resolved!");
        loadAppeals();
        loadBans();
        loadMembers();
    } catch(e) { alert("Error: " + e.message); }
}

// Load appeals when tab is clicked
document.querySelector('.admin-tab[data-tab="appeals"]').addEventListener('click', loadAppeals);
