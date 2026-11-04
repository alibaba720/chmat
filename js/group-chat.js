import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, updateDoc, arrayRemove } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

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

    // Currently, we are checking if the current user is the creator (admin).
    // In the next step, we will change this to an 'admins' array.
    const isAdmin = groupData.admin === currentUser.uid;
    
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
            
            const isOwner = uid === groupData.admin;
            const ownerBadge = isOwner ? `<span style="font-size:10px; background:#0095f6; padding:2px 6px; border-radius:4px; margin-left:5px;">Admin</span>` : '';
            
            let kickBtn = '';
            if(isAdmin && !isOwner) {
                kickBtn = `<button onclick="kickMember('${uid}')" style="background:#ff3b30; color:#fff; border:none; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:bold; cursor:pointer;">Kick</button>`;
            }

            membersHtml += `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #222;">
                <div style="display:flex; align-items:center; gap:12px;">
                  <div style="width:40px; height:40px; border-radius:50%; overflow:hidden;">${avatar}</div>
                  <div>
                    <div style="font-size:15px; font-weight:600;">${uData.displayName || uData.username} ${ownerBadge}</div>
                    <div style="font-size:12px; color:#888;">@${uData.username}</div>
                  </div>
                </div>
                ${kickBtn}
              </div>
            `;
        }
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
            <p style="color:#888; margin:5px 0 0 0; font-size:14px;">${groupData.members.length} Members</p>
            
            <!-- Placeholder for Admin Settings & Activity Log (To be added next) -->
            ${isAdmin ? `<button style="margin-top:10px; background:#262626; color:#fff; border:none; padding:8px 16px; border-radius:8px; font-size:12px;">Edit Group (Coming Soon)</button>` : ''}
        </div>
        
        <div style="overflow-y:auto; flex:1;">
            ${membersHtml}
        </div>
      </div>
    `;
};

window.kickMember = async function(uid) {
    if(!confirm("Are you sure you want to kick this member?")) return;
    try {
        await updateDoc(doc(db, "groups", groupId), {
            members: arrayRemove(uid)
        });
        alert("Member kicked successfully!");
        await loadGroupData(); 
        openGroupInfo(); 
    } catch(e) {
        alert("Error kicking member: " + e.message);
    }
};
