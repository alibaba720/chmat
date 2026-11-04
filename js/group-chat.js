import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

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

if (!groupId || !groupName) {
    window.location.href = 'app.html';
}

chatName.innerText = groupName;
chatAvatar.innerText = groupName.charAt(0).toUpperCase();

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
            currentUserData = docSnap.data();
            loadMessages();
        }
    } else {
        window.location.href = 'login.html';
    }
});

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

            // Group chat mein dusron ka naam dikhana zaroori hai
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

    try {
        await addDoc(collection(db, "groups", groupId, "messages"), {
            senderId: currentUser.uid,
            senderName: currentUserData.displayName || currentUserData.username,
            text: text,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error sending message: ", error);
        alert("Message send nahi hua.");
    }
}


// --- MIC / SEND TOGGLE LOGIC ---
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


// --- HEADER CLICK LOGIC ---
const headerInfo = document.querySelector('.chat-user-info');
if (headerInfo) {
    headerInfo.addEventListener('click', () => {
        if (typeof window.openGroupInfo === 'function') {
            window.openGroupInfo();
        } else {
            console.log('Group Info function not found');
        }
    });
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
    }
});
