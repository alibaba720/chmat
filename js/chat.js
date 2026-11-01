import { auth, db, authReady } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, onSnapshot, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const receiverId = urlParams.get('uid');
const receiverName = urlParams.get('name');

const chatName = document.getElementById('chatName');
const messagesContainer = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendMessageBtn');
const recordBtn = document.getElementById('recordBtn');
const recordingOverlay = document.getElementById('recordingOverlay');
const recordingTimer = document.getElementById('recordingTimer');
const chatInputArea = document.getElementById('chatInputArea');

let currentUser = null;
let currentUserData = null;
let receiverData = null;
let chatId = "";
let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let timerInterval;
let startTime;
let currentStream = null;

if (!receiverId || !receiverName) { window.location.href = 'app.html'; }
chatName.innerText = receiverName;

function getChatId(uid1, uid2) { return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`; }

authReady.then(() => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            chatId = getChatId(currentUser.uid, receiverId);
            const myDoc = await getDoc(doc(db, "users", currentUser.uid));
            if(myDoc.exists()) currentUserData = myDoc.data();
            loadMessages();
            loadReceiverInfo();
        } else { window.location.href = 'login.html'; }
    });
});

async function loadReceiverInfo() {
    const docSnap = await getDoc(doc(db, "users", receiverId));
    if(docSnap.exists()) receiverData = docSnap.data();
}

// --- CHAT INFO LOGIC ---
window.openChatInfo = function() {
    document.getElementById('chatInfoOverlay').classList.remove('hidden');
    
    const infoAvatar = document.getElementById('infoAvatar');
    const infoName = document.getElementById('infoName');
    
    if (receiverData) {
        infoName.innerText = receiverData.displayName || receiverData.username;
        if (receiverData.profilePicUrl) {
            infoAvatar.innerHTML = `<img src="${receiverData.profilePicUrl}">`;
        } else {
            infoAvatar.innerText = (receiverData.displayName || receiverData.username).charAt(0).toUpperCase();
        }
    }

    // Check Pin Status
    const pinnedChats = currentUserData.pinnedChats || [];
    if (pinnedChats.includes(receiverId)) {
        document.getElementById('pinIcon').innerText = "📌";
        document.getElementById('pinText').innerText = "Unpin from top";
    } else {
        document.getElementById('pinIcon').innerText = "📍";
        document.getElementById('pinText').innerText = "Pin to top";
    }

    // Check Mute Status
    const mutedChats = currentUserData.mutedChats || [];
    if (mutedChats.includes(receiverId)) {
        document.getElementById('muteIcon').innerText = "🔕";
        document.getElementById('muteText').innerText = "Unmute";
    } else {
        document.getElementById('muteIcon').innerText = "🔔";
        document.getElementById('muteText').innerText = "Mute";
    }
};

window.closeChatInfo = function() {
    document.getElementById('chatInfoOverlay').classList.add('hidden');
    document.getElementById('infoOptionsMenu').classList.add('hidden');
};

window.toggleOptionsMenu = function() {
    document.getElementById('infoOptionsMenu').classList.toggle('hidden');
};

window.togglePin = async function() {
    try {
        const pinnedChats = currentUserData.pinnedChats || [];
        if (pinnedChats.includes(receiverId)) {
            await updateDoc(doc(db, "users", currentUser.uid), { pinnedChats: arrayRemove(receiverId) });
            currentUserData.pinnedChats = currentUserData.pinnedChats.filter(id => id !== receiverId);
            document.getElementById('pinText').innerText = "Pin to top";
            document.getElementById('pinIcon').innerText = "📍";
        } else {
            await updateDoc(doc(db, "users", currentUser.uid), { pinnedChats: arrayUnion(receiverId) });
            if(!currentUserData.pinnedChats) currentUserData.pinnedChats = [];
            currentUserData.pinnedChats.push(receiverId);
            document.getElementById('pinText').innerText = "Unpin from top";
            document.getElementById('pinIcon').innerText = "📌";
        }
    } catch(e) { alert("Error updating pin: " + e.message); }
};

window.toggleMute = async function() {
    try {
        const mutedChats = currentUserData.mutedChats || [];
        if (mutedChats.includes(receiverId)) {
            await updateDoc(doc(db, "users", currentUser.uid), { mutedChats: arrayRemove(receiverId) });
            currentUserData.mutedChats = currentUserData.mutedChats.filter(id => id !== receiverId);
            document.getElementById('muteText').innerText = "Mute";
            document.getElementById('muteIcon').innerText = "🔔";
        } else {
            await updateDoc(doc(db, "users", currentUser.uid), { mutedChats: arrayUnion(receiverId) });
            if(!currentUserData.mutedChats) currentUserData.mutedChats = [];
            currentUserData.mutedChats.push(receiverId);
            document.getElementById('muteText').innerText = "Unmute";
            document.getElementById('muteIcon').innerText = "🔕";
        }
    } catch(e) { alert("Error updating mute: " + e.message); }
};

window.blockUser = async function() {
    if(!confirm("Block this user? They will be removed from your friends.")) return;
    try {
        await updateDoc(doc(db, "users", currentUser.uid), { friends: arrayRemove(receiverId), blocked: arrayUnion(receiverId) });
        await updateDoc(doc(db, "users", receiverId), { friends: arrayRemove(currentUser.uid) });
        alert("User blocked.");
        window.location.href = 'app.html';
    } catch(e) { alert("Error blocking: " + e.message); }
};

window.reportUser = async function() {
    let reason = prompt("Report User\n\nReason:\n1. Fake Account\n2. Harassment\n3. Spam");
    if(!reason) return;
    try {
        await addDoc(collection(db, "reports"), { type: "profile", targetId: receiverId, reporterId: currentUser.uid, reason: reason, status: "pending", createdAt: serverTimestamp() });
        alert("Report submitted.");
        document.getElementById('infoOptionsMenu').classList.add('hidden');
    } catch(e) { alert("Error reporting: " + e.message); }
};
// --- END CHAT INFO LOGIC ---

messageInput.addEventListener('input', () => {
    if (messageInput.value.trim().length > 0) {
        recordBtn.style.display = 'none';
        sendBtn.style.display = 'flex';
    } else {
        recordBtn.style.display = 'flex';
        sendBtn.style.display = 'none';
    }
});

function renderMessagesHTML(msgs) {
    messagesContainer.innerHTML = ''; 
    msgs.forEach((msg) => {
        const isSentByMe = msg.senderId === currentUser.uid;
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isSentByMe ? 'sent' : 'received'}`;
        
        let timeStr = "";
        if (msg.createdAt) {
            const date = msg.createdAt.toDate();
            timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        if (msg.type === 'audio') {
            msgDiv.innerHTML = `<audio controls preload="metadata" src="${msg.audioUrl}" style="width: 200px;"></audio><div class="msg-time" style="float:none; text-align:right; margin-top:4px;">${timeStr}</div>`;
        } else {
            msgDiv.innerHTML = `${msg.text} <span class="msg-time">${timeStr}</span>`;
        }
        messagesContainer.appendChild(msgDiv);
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function loadMessages() {
    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, where("chatId", "==", chatId));

    const cachedChat = localStorage.getItem('chmat_chat_' + chatId);
    if (cachedChat) {
        try { renderMessagesHTML(JSON.parse(cachedChat)); } catch(e) {}
    }

    onSnapshot(q, (snapshot) => {
        let msgs = [];
        snapshot.forEach((doc) => { msgs.push({ id: doc.id, ...doc.data() }); });
        msgs.sort((a,b) => { 
            const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
            const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
            return timeA - timeB; 
        });
        localStorage.setItem('chmat_chat_' + chatId, JSON.stringify(msgs));
        renderMessagesHTML(msgs);
    });
}

async function sendTextMessage() {
    const text = messageInput.value.trim();
    if (text === "" || !currentUser) return;
    
    messageInput.value = ""; 
    recordBtn.style.display = 'flex';
    sendBtn.style.display = 'none';

    try {
        await addDoc(collection(db, "messages"), {
            chatId: chatId, senderId: currentUser.uid, receiverId: receiverId,
            text: text, type: "text", createdAt: serverTimestamp()
        });
    } catch (error) { console.error(error); }
}

sendBtn.addEventListener('click', sendTextMessage);
messageInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendTextMessage(); } });

recordBtn.addEventListener('click', async () => {
    if (isRecording) return;
    
    try {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            currentStream = null;
        }

        currentStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(currentStream, { mimeType: 'audio/webm' });
        audioChunks = [];

        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            clearInterval(timerInterval);
            
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
                currentStream = null;
            }

            recordingOverlay.classList.add('hidden');
            chatInputArea.style.display = 'flex';
            
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            recordBtn.style.color = "#ffd700"; 

            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result;
                try {
                    await addDoc(collection(db, "messages"), { 
                        chatId: chatId, senderId: currentUser.uid, receiverId: receiverId, 
                        type: "audio", audioUrl: base64Audio, createdAt: serverTimestamp() 
                    });
                } catch (err) {
                    console.error(err);
                    alert("Failed to send voice note.");
                }
                recordBtn.style.color = "#0095f6"; 
            };
        };

        mediaRecorder.start();
        isRecording = true;
        recordingOverlay.classList.remove('hidden');
        chatInputArea.style.display = 'none';
        
        startTime = Date.now();
        recordingTimer.innerText = "0:00";
        timerInterval = setInterval(() => {
            const diff = Math.floor((Date.now() - startTime) / 1000);
            const mins = Math.floor(diff / 60).toString().padStart(2, '0');
            const secs = (diff % 60).toString().padStart(2, '0');
            recordingTimer.innerText = `${mins}:${secs}`;
        }, 1000);

    } catch (err) {
        alert("Mic Error: " + err.message);
    }
});

window.stopAndSendRecording = function() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
    }
};

window.cancelRecording = function() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.onstop = null; 
        mediaRecorder.stop();
        isRecording = false;
        clearInterval(timerInterval);
        
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            currentStream = null;
        }
        
        recordingOverlay.classList.add('hidden');
        chatInputArea.style.display = 'flex';
    }
};
