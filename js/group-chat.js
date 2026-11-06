import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { collection, query, orderBy, getDocs, onSnapshot, addDoc, serverTimestamp, doc, getDoc, updateDoc, arrayRemove } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const groupId = urlParams.get('gid');
const groupName = urlParams.get('name');

const chatName = document.getElementById('chatName');
const chatAvatar = document.getElementById('chatAvatar');
const messagesContainer = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const micBtn = document.getElementById('micBtn');
const sendBtn = document.getElementById('sendMessageBtn');

let currentUser = null;
let currentUserData = null;
let groupData = null;

if (!groupId || !groupName) {
    window.location.href = 'app.html';
}

chatName.innerText = groupName;
chatAvatar.innerText = groupName.charAt(0).toUpperCase();

// --- 1. FIX HEADER CLICK (Direct JS) ---
const headerInfo = document.querySelector('.chat-user-info');
if (headerInfo) {
    headerInfo.addEventListener('click', () => {
        openGroupInfo();
    });
}

// --- 2. FIX MIC/SEND TOGGLE ---
if (messageInput && micBtn && sendBtn) {
    messageInput.addEventListener('input', () => {
        if (messageInput.value.trim().length > 0) {
            micBtn.style.display = 'none';
            sendBtn.style.display = 'flex';
        } else {
            micBtn.style.display = 'flex';
            sendBtn.style.display = 'none';
        }
    });
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
            currentUserData = docSnap.data();
            await loadGroupData();
            loadMessages();
        }
    } else {
        window.location.href = 'login.html';
    }
});

async function loadGroupData() {
    const groupRef = doc(db, "groups", groupId);
    const groupSnap = await getDoc(groupRef);
    if(groupSnap.exists()) {
        groupData = groupSnap.data();
    }
}

function loadMessages() {
    const messagesRef = collection(db, "groups", groupId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    onSnapshot(q, (snapshot) => {
        messagesContainer.innerHTML = '';

        snapshot.forEach((doc) => {
            const msg = doc.data();
            
            // System Message Handler
            if (msg.type === 'system') {
                const sysDiv = document.createElement('div');
                sysDiv.style.cssText = 'text-align:center; font-size:12px; color:#888; margin:10px 0; background:#1a1a1a; padding:6px; border-radius:8px; display:inline-block; width:100%;';
                let actionText = msg.text === 'kicked' ? 'removed' : (msg.text === 'promoted' ? 'promoted to admin' : 'demoted to member');
                
                sysDiv.innerHTML = `<span style="color:#0095f6; font-weight:bold; cursor:pointer;" onclick="window.location.href='profile.html?uid=${msg.senderId}'">@${msg.senderName}</span> ${actionText} <span style="color:#ffd700; font-weight:bold; cursor:pointer;" onclick="window.location.href='profile.html?uid=${msg.targetId}'">@${msg.targetName}</span>`;
                messagesContainer.appendChild(sysDiv);
                return;
            }

            const isSentByMe = msg.senderId === currentUser.uid;
            const msgDiv = document.createElement('div');
            msgDiv.className = `message ${isSentByMe ? 'sent' : 'received'}`;

            let timeStr = "";
            if (msg.createdAt) {
                const date = msg.createdAt.toDate();
                timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            let senderNameHtml = "";
            if (!isSentByMe) {
                senderNameHtml = `<div style="font-size: 11px; font-weight: bold; color: #0095f6; margin-bottom: 4px;">${msg.senderName}</div>`;
            }

            msgDiv.innerHTML = `
                ${senderNameHtml}
                ${msg.text}
                <span class="msg-time">${timeStr}</span>
            `;
            messagesContainer.appendChild(msgDiv);
        });

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}

async function sendMessage() {
    const text = messageInput.value.trim();
    if (text === "" || !currentUser || !currentUserData) return;

    messageInput.value = "";
    
    // Reset toggle
    if (micBtn && sendBtn) {
        micBtn.style.display = 'flex';
        sendBtn.style.display = 'none';
    }

    try {
        await addDoc(collection(db, "groups", groupId, "messages"), {
            senderId: currentUser.uid,
            senderName: currentUserData.displayName || currentUserData.username,
            text: text,
            createdAt: serverTimestamp()
        });
        
        // Update group last message
        await updateDoc(doc(db, "groups", groupId), {
            lastMessage: `${currentUserData.displayName || currentUserData.username}: ${text}`,
            lastTime: serverTimestamp()
        });

    } catch (error) {
        console.error("Error sending message: ", error);
        alert("Message send nahi hua.");
    }
}

if(sendBtn) sendBtn.addEventListener('click', sendMessage);
if(messageInput) {
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });
}

// --- 3. GROUP INFO MODAL (WITH ADMIN RULES) ---
window.openGroupInfo = async function() {
    if(!groupData) await loadGroupData();
    if(!groupData) return;

    // Support old data and new data
    const ownerUid = groupData.owner || groupData.admin;
    const adminsList = groupData.admins || (groupData.admin ? [groupData.admin] : []);
    
    const isOwner = ownerUid === currentUser.uid;
    const isAdmin = isOwner || adminsList.includes(currentUser.uid);

    let modal = document.getElementById('groupInfoModal');
    if(!modal) {
        modal = document.createElement('div');
        modal.id = 'groupInfoModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 9999; display: flex; justify-content: center; align-items: flex-end;';
        document.body.appendChild(modal);
    }
    modal.style.display = 'flex';

    let membersHtml = '';
    for(const uid of groupData.members) {
        const uSnap = await getDoc(doc(db, "users", uid));
        if(uSnap.exists()) {
            const uData = uSnap.data();
            const initial = (uData.displayName || uData.username).charAt(0).toUpperCase();
            const avatar = uData.profilePicUrl ? `<img src="${uData.profilePicUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : `<div style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;background:#333;border-radius:50%;font-weight:bold;">${initial}</div>`;
            
            const isMemberOwner = uid === ownerUid;
            const isMemberAdmin = adminsList.includes(uid);
            
            let badge = '';
            if (isMemberOwner) badge = `<span style="background:#ffd700; color:#000; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold; margin-left:5px;">OWNER</span>`;
            else if (isMemberAdmin) badge = `<span style="background:#0095f6; color:#fff; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold; margin-left:5px;">ADMIN</span>`;

            let actionBtns = '';
            if (!isMemberOwner && isAdmin && uid !== currentUser.uid) {
                // Admins can kick members
                actionBtns += `<button onclick="kickMember('${uid}', '${uData.username}')" style="background:#ff3b30; color:#fff; border:none; padding:6px 10px; border-radius:6px; font-size:11px; font-weight:bold; margin-left:5px; cursor:pointer;">Kick</button>`;

                // Only Owner can promote/demote
                if (isOwner) {
                    if (isMemberAdmin) {
                        actionBtns += `<button onclick="demoteAdmin('${uid}', '${uData.username}')" style="background:#444; color:#fff; border:none; padding:6px 10px; border-radius:6px; font-size:11px; font-weight:bold; margin-left:5px; cursor:pointer;">Demote</button>`;
                    } else {
                        actionBtns += `<button onclick="makeAdmin('${uid}', '${uData.username}')" style="background:#0095f6; color:#fff; border:none; padding:6px 10px; border-radius:6px; font-size:11px; font-weight:bold; margin-left:5px; cursor:pointer;">Admin</button>`;
                    }
                }
            }

            membersHtml += `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #222;">
                <div style="display:flex; align-items:center; gap:12px;">
                  <div style="width:40px; height:40px; border-radius:50%; overflow:hidden;">${avatar}</div>
                  <div>
                    <div style="font-size:15px; font-weight:600; display:flex; align-items:center;">${uData.displayName || uData.username} ${badge}</div>
                    <div style="font-size:12px; color:#888;">@${uData.username}</div>
                  </div>
                </div>
                <div style="display:flex;">${actionBtns}</div>
              </div>
            `;
        }
    }

    let adminSettingsBtn = '';
    if (isAdmin) {
        // Privacy toggle (Only Owner can change, Admins can see status)
        let isPrivacyOn = groupData.adminApproval === true;
        let privacyBtn = isOwner ? 
            `<button onclick="toggleAdminApproval()" style="background:#262626; color:${isPrivacyOn ? '#0095f6' : '#888'}; border:1px solid #444; padding:8px 12px; border-radius:8px; font-size:12px; font-weight:bold; margin-left:5px;">Approval: ${isPrivacyOn ? 'ON' : 'OFF'}</button>` : 
            `<span style="color:#888; font-size:12px; margin-left:5px;">Approval: ${isPrivacyOn ? 'ON' : 'OFF'}</span>`;

        adminSettingsBtn = `
            <div style="display:flex; justify-content:center; gap:8px; margin-top:15px; flex-wrap:wrap;">
                <button onclick="openAddMemberModal()" style="background:#0095f6; color:#fff; border:none; padding:8px 16px; border-radius:8px; font-size:13px; font-weight:bold;">Add Member</button>
                <button onclick="openAdminActivity()" style="background:#262626; color:#fff; border:1px solid #444; padding:8px 16px; border-radius:8px; font-size:13px; font-weight:bold;">Activity Log</button>
                ${privacyBtn}
            </div>
        `;
    }

    modal.innerHTML = `
      <div style="background:#111; width:100%; max-width:600px; border-radius:20px 20px 0 0; padding:20px; display:flex; flex-direction:column; max-height:85vh; border-top: 1px solid #333;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #333; padding-bottom:10px;">
            <h3 style="margin:0; font-size:18px;">Group Info</h3>
            <button onclick="document.getElementById('groupInfoModal').style.display='none'" style="background:none; border:none; color:#fff; font-size:24px; cursor:pointer;">✕</button>
        </div>
        
        <div style="text-align:center; margin-bottom:20px;">
            <div style="width:80px; height:80px; border-radius:50%; background:#0095f6; border:2px solid #333; display:flex; justify-content:center; align-items:center; font-size:32px; font-weight:bold; margin:0 auto 10px;">${groupData.name.charAt(0).toUpperCase()}</div>
            <h2 style="margin:0;">${groupData.name}</h2>
            <p style="color:#888; margin:5px 0 10px 0; font-size:14px;">${groupData.members.length} Members</p>
            ${adminSettingsBtn}
        </div>
        
        <div style="overflow-y:auto; flex:1;">
            ${membersHtml}
        </div>
      </div>
    `;
};

window.kickMember = async function(uid, username) {
    if(!confirm("Are you sure you want to kick @" + username + "?")) return;
    try {
        await updateDoc(doc(db, "groups", groupId), { members: arrayRemove(uid) });
        await logActivity("Kicked", username);
        await addDoc(collection(db, "groups", groupId, "messages"), {
            type: 'system', text: 'kicked', senderId: currentUser.uid, senderName: currentUserData.username, targetId: uid, targetName: username, createdAt: serverTimestamp()
        });
        alert("Member kicked successfully!");
        await loadGroupData(); 
        openGroupInfo(); 
    } catch(e) { alert("Error kicking member: " + e.message); }
};

window.makeAdmin = async function(uid, username) {
    if(!confirm("Make @" + username + " an admin?")) return;
    try {
        const groupSnap = await getDoc(doc(db, "groups", groupId));
        let currentAdmins = groupSnap.data().admins || (groupSnap.data().admin ? [groupSnap.data().admin] : []);
        currentAdmins.push(uid);
        await updateDoc(doc(db, "groups", groupId), { admins: currentAdmins });
        await logActivity("Promoted to Admin", username);
        await addDoc(collection(db, "groups", groupId, "messages"), {
            type: 'system', text: 'promoted', senderId: currentUser.uid, senderName: currentUserData.username, targetId: uid, targetName: username, createdAt: serverTimestamp()
        });
        await loadGroupData(); 
        openGroupInfo(); 
    } catch(e) { alert("Error: " + e.message); }
};

window.demoteAdmin = async function(uid, username) {
    if(!confirm("Remove admin rights from @" + username + "?")) return;
    try {
        const groupSnap = await getDoc(doc(db, "groups", groupId));
        let currentAdmins = groupSnap.data().admins || (groupSnap.data().admin ? [groupSnap.data().admin] : []);
        currentAdmins = currentAdmins.filter(id => id !== uid);
        await updateDoc(doc(db, "groups", groupId), { admins: currentAdmins });
        await logActivity("Demoted to Member", username);
        await addDoc(collection(db, "groups", groupId, "messages"), {
            type: 'system', text: 'demoted', senderId: currentUser.uid, senderName: currentUserData.username, targetId: uid, targetName: username, createdAt: serverTimestamp()
        });
        await loadGroupData(); 
        openGroupInfo(); 
    } catch(e) { alert("Error: " + e.message); }
};

async function logActivity(action, targetName) {
    try {
        await addDoc(collection(db, "groups", groupId, "activity"), {
            action: action,
            target: targetName,
            performedBy: currentUserData.username,
            timestamp: serverTimestamp()
        });
    } catch(e) { console.log("Log error", e); }
}

window.openAdminActivity = async function() {
    const modal = document.getElementById('groupInfoModal');
    const contentBox = modal.querySelector('div[style*="background:#111"]');
    contentBox.innerHTML = '<p style="color:#fff; text-align:center; padding:20px;">Loading Activity...</p>';
    
    try {
        const q = query(collection(db, "groups", groupId, "activity"), orderBy("timestamp", "desc"));
        const snap = await getDocs(q);
        
        let html = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #333; padding-bottom:10px;">
              <button onclick="openGroupInfo()" style="background:none; border:none; color:#0095f6; font-size:16px; cursor:pointer;">← Back</button>
              <h3 style="margin:0; font-size:18px;">Admin Activity</h3>
              <div style="width:40px;"></div>
          </div>
          <div style="overflow-y:auto; flex:1; color:#fff;">
        `;
        
        if (snap.empty) {
            html += '<p style="text-align:center; color:#888;">No activity yet.</p>';
        } else {
            snap.forEach(doc => {
                const act = doc.data();
                let dateStr = act.timestamp ? act.timestamp.toDate().toLocaleString() : "Just now";
                html += `
                  <div style="padding:10px 0; border-bottom:1px solid #222; font-size:14px;">
                      <span style="color:#0095f6; font-weight:bold;">@${act.performedBy}</span> 
                      ${act.action} 
                      <span style="color:#ffd700; font-weight:bold;">@${act.target}</span>
                      <div style="font-size:11px; color:#888; margin-top:3px;">${dateStr}</div>
                  </div>
                `;
            });
        }
        html += '</div>';
        contentBox.innerHTML = html;
    } catch(e) {
        contentBox.innerHTML = `<p style="color:red; padding:20px;">Error loading activity: ${e.message}</p>`;
    }
};

// --- PHASE 2: ADD MEMBER & APPROVAL LOGIC ---

window.toggleAdminApproval = async function() {
    if(!confirm("Change Admin Approval setting for this group?")) return;
    try {
        const groupSnap = await getDoc(doc(db, "groups", groupId));
        const currentStatus = groupSnap.data().adminApproval || false;
        await updateDoc(doc(db, "groups", groupId), { adminApproval: !currentStatus });
        await loadGroupData();
        openGroupInfo(); // Refresh UI
    } catch(e) { alert("Error: " + e.message); }
};

window.openAddMemberModal = async function() {
    let modal = document.getElementById('addMemberModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'addMemberModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 10005; display: flex; flex-direction: column;';
        document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div style="padding: 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222;">
            <h3 style="margin:0; color:#fff; font-size:18px;">Add Members</h3>
            <button onclick="document.getElementById('addMemberModal').style.display='none'" style="background:none; border:none; color:#fff; font-size:24px;">✕</button>
        </div>
        <div id="addMemberList" style="padding: 16px; overflow-y:auto; flex:1; color:#fff;">
            <p style="text-align:center; color:#888;">Loading friends...</p>
        </div>
    `;

    try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        const myFriends = userDoc.data().friends || [];
        
        // Filter friends who are NOT already in the group
        const availableFriends = myFriends.filter(fid => !groupData.members.includes(fid));
        
        if (availableFriends.length === 0) {
            document.getElementById('addMemberList').innerHTML = '<p style="text-align:center; color:#888;">All your friends are already in this group or you have no friends.</p>';
            return;
        }

        let html = '';
        for (const fid of availableFriends) {
            const uSnap = await getDoc(doc(db, "users", fid));
            if (uSnap.exists()) {
                const uData = uSnap.data();
                const initial = (uData.displayName || uData.username).charAt(0).toUpperCase();
                const avatar = uData.profilePicUrl ? `<img src="${uData.profilePicUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : `<div style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;background:#333;border-radius:50%;font-weight:bold;">${initial}</div>`;
                
                html += `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #222;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div style="width:40px; height:40px; border-radius:50%; overflow:hidden;">${avatar}</div>
                        <div>
                            <div style="font-size:15px; font-weight:600;">${uData.displayName || uData.username}</div>
                            <div style="font-size:12px; color:#888;">@${uData.username}</div>
                        </div>
                    </div>
                    <button onclick="handleAddMember('${fid}', '${uData.username}')" style="background:#0095f6; color:#fff; border:none; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:bold;">Add</button>
                </div>`;
            }
        }
        document.getElementById('addMemberList').innerHTML = html;
    } catch(e) {
        document.getElementById('addMemberList').innerHTML = `<p style="color:red;">Error loading friends: ${e.message}</p>`;
    }
};

window.handleAddMember = async function(fid, fname) {
    const isAdmin = groupData.owner === currentUser.uid || (groupData.admins && groupData.admins.includes(currentUser.uid));
    const isApprovalRequired = groupData.adminApproval === true;

    if (isAdmin || !isApprovalRequired) {
        // Directly add
        try {
            await updateDoc(doc(db, "groups", groupId), { members: arrayUnion(fid) });
            await logActivity("Added to group", fname);
            alert(fname + " added successfully!");
            await loadGroupData();
            openGroupInfo();
            document.getElementById('addMemberModal').style.display = 'none';
        } catch(e) { alert("Error: " + e.message); }
    } else {
        // Send approval request to Admin/Owner
        try {
            const ownerUid = groupData.owner || groupData.admin;
            await addDoc(collection(db, "groups", groupId, "approvals"), {
                targetUid: fid,
                targetUsername: fname,
                requestedBy: currentUser.uid,
                requestedByName: currentUserData.username,
                status: "pending",
                createdAt: serverTimestamp()
            });
            alert("Request sent to Admin for approval.");
            document.getElementById('addMemberModal').style.display = 'none';
        } catch(e) { alert("Error sending request: " + e.message); }
    }
};
