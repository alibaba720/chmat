import { auth, db, authReady } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, onSnapshot, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const receiverId = urlParams.get('uid');
const receiverName = urlParams.get('name');

const chatName = document.getElementById('chatName');
const chatAvatar = document.getElementById('chatAvatar');
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
let currentMessages = [];
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
            
            const recDoc = await getDoc(doc(db, "users", receiverId));
            if(recDoc.exists()) {
                receiverData = recDoc.data();
                updateHeaderUI();
            }
            loadMessages();
        } else { window.location.href = 'login.html'; }
    });
});

function updateHeaderUI() {
    if (receiverData) {
        chatName.innerText = receiverData.displayName || receiverData.username;
        if (receiverData.profilePicUrl) {
            chatAvatar.innerHTML = `<img src="${receiverData.profilePicUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
        }
    }
}

// --- SEARCH LOGIC ---
window.openSearch = function() {
    document.getElementById('searchContainer').classList.remove('hidden');
    document.getElementById('mainChatHeader').style.display = 'none';
    document.getElementById('chatSearchInput').focus();
};

window.closeSearch = function() {
    document.getElementById('searchContainer').classList.add('hidden');
    document.getElementById('mainChatHeader').style.display = 'flex';
    document.getElementById('searchResultsList').classList.add('hidden');
    document.getElementById('chatSearchInput').value = '';
};

window.performSearch = function() {
    const term = document.getElementById('chatSearchInput').value.toLowerCase();
    const resultsList = document.getElementById('searchResultsList');
    
    if (term.length < 2) {
        resultsList.classList.add('hidden');
        return;
    }
    
    resultsList.classList.remove('hidden');
    let html = '';
    currentMessages.forEach(msg => {
        if (msg.type === 'text' && msg.text.toLowerCase().includes(term)) {
            html += `<div class="search-result-item" onclick="scrollToMessage('${msg.id}')">...${msg.text}...</div>`;
        }
    });
    
    resultsList.innerHTML = html !== '' ? html : '<div class="search-result-item">No messages found.</div>';
};

window.scrollToMessage = function(msgId) {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.backgroundColor = 'rgba(0,149,246,0.3)'; // Highlight
        setTimeout(() => { el.style.backgroundColor = ''; }, 1500);
        closeSearch();
    }
};

// --- CHAT INFO & MODALS ---
window.openChatInfo = function() {
    document.getElementById('chatInfoOverlay').classList.remove('hidden');
    if (receiverData) {
        document.getElementById('infoName').innerText = receiverData.displayName || receiverData.username;
        const infoAvatar = document.getElementById('infoAvatar');
        if (receiverData.profilePicUrl) infoAvatar.innerHTML = `<img src="${receiverData.profilePicUrl}">`;
        else infoAvatar.innerText = (receiverData.displayName || receiverData.username).charAt(0).toUpperCase();
    }
    checkPinStatus();
    checkMuteStatus();
    checkDisappearStatus();
};

window.closeChatInfo = function() {
    document.getElementById('chatInfoOverlay').classList.add('hidden');
    document.getElementById('infoOptionsMenu').classList.add('hidden');
};

window.toggleOptionsMenu = function() {
    document.getElementById('infoOptionsMenu').classList.toggle('hidden');
};

// MUTE LOGIC
window.openMuteModal = function() { document.getElementById('muteModal').classList.remove('hidden'); };
window.closeMuteModal = function() { document.getElementById('muteModal').classList.add('hidden'); };
window.setMute = async function(duration) {
    let muteUntil = 0;
    if(duration === '1h') muteUntil = Date.now() + (60*60*1000);
    else if(duration === '24h') muteUntil = Date.now() + (24*60*60*1000);
    else if(duration === 'forever') muteUntil = 9999999999999;
    
    try {
        await updateDoc(doc(db, "users", currentUser.uid), { [`muted_${receiverId}`]: muteUntil });
        closeMuteModal();
        checkMuteStatus();
    } catch(e) { alert("Error: " + e.message); }
};

function checkMuteStatus() {
    const muteUntil = currentUserData[`muted_${receiverId}`] || 0;
    if (muteUntil > Date.now()) {
        document.getElementById('muteIcon').innerText = "🔕";
        document.getElementById('muteText').innerText = "Muted";
    } else {
        document.getElementById('muteIcon').innerText = "🔔";
        document.getElementById('muteText').innerText = "Mute";
    }
}

// DISAPPEARING LOGIC
window.openDisappearingModal = function() { document.getElementById('disappearModal').classList.remove('hidden'); };
window.closeDisappearingModal = function() { document.getElementById('disappearModal').classList.add('hidden'); };
window.setDisappear = async function(time) {
    try {
        await updateDoc(doc(db, "users", currentUser.uid), { [`disappear_${receiverId}`]: time });
        closeDisappearingModal();
        checkDisappearStatus();
    } catch(e) { alert("Error: " + e.message); }
};

function checkDisappearStatus() {
    const status = currentUserData[`disappear_${receiverId}`] || 'Off';
    document.getElementById('disappearStatus').innerText = status;
}

// PIN & PRIVACY LOGIC
window.openPrivacyModal = function() {
    // For now, prompt for PIN. In next step we'll build the UI.
    let pin = prompt("Set 4-digit PIN for this chat (Cancel to remove):");
    if(pin) {
        if(pin.length !== 4 || isNaN(pin)) { alert("Must be 4 digits!"); return; }
        localStorage.setItem('chmat_pin_' + chatId, pin);
        alert("PIN set successfully!");
    } else {
        localStorage.removeItem('chmat_pin_' + chatId);
        alert("PIN removed.");
    }
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
    } catch(e) { alert("Error: " + e.message); }
};

function checkPinStatus() {
    const pinnedChats = currentUserData.pinnedChats || [];
    if (pinnedChats.includes(receiverId)) {
        document.getElementById('pinIcon').innerText = "📌";
        document.getElementById('pinText').innerText = "Unpin from top";
    } else {
        document.getElementById('pinIcon').innerText = "📍";
        document.getElementById('pinText').innerText = "Pin to top";
    }
}

window.blockUser = async function() {
    if(!confirm("Block this user? They will be removed from your friends.")) return;
    try {
        await updateDoc(doc(db, "users", currentUser.uid), { friends: arrayRemove(receiverId), blocked: arrayUnion(receiverId) });
        await updateDoc(doc(db, "users", receiverId), { friends: arrayRemove(currentUser.uid) });
        alert("User blocked.");
        window.location.href = 'app.html';
    } catch(e) { alert("Error: " + e.message); }
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

// --- MESSAGES LOGIC ---
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
        msgDiv.id = `msg-${msg.id}`; // For search jumping
        
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
        try { 
            currentMessages = JSON.parse(cachedChat);
            renderMessagesHTML(currentMessages); 
        } catch(e) {}
    }

    onSnapshot(q, (snapshot) => {
        let msgs = [];
        snapshot.forEach((doc) => { msgs.push({ id: doc.id, ...doc.data() }); });
        msgs.sort((a,b) => { 
            const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
            const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
            return timeA - timeB; 
        });
        
        // Disappearing Messages Logic (Client-side filter)
        const disappearTime = currentUserData[`disappear_${receiverId}`] || 'Off';
        if (disappearTime !== 'Off') {
            let maxAge = 0;
            if(disappearTime === '24h') maxAge = 24*60*60*1000;
            if(disappearTime === '7d') maxAge = 7*24*60*60*1000;
            
            const now = Date.now();
            msgs = msgs.filter(m => {
                const mTime = m.createdAt ? m.createdAt.toMillis() : now;
                return (now - mTime) < maxAge;
            });
        }

        currentMessages = msgs;
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

// --- RECORDING (Base64) ---
recordBtn.addEventListener('click', async () => {
    if (isRecording) return;
    try {
        if (currentStream) currentStream.getTracks().forEach(track => track.stop());
        currentStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(currentStream, { mimeType: 'audio/webm' });
        audioChunks = [];

        mediaRecorder.ondataavailable = event => { if (event.data.size > 0) audioChunks.push(event.data); };
        mediaRecorder.onstop = async () => {
            clearInterval(timerInterval);
            if (currentStream) { currentStream.getTracks().forEach(track => track.stop()); currentStream = null; }
            recordingOverlay.classList.add('hidden');
            chatInputArea.style.display = 'flex';
            
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            recordBtn.style.color = "#ffd700"; 

            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                try {
                    await addDoc(collection(db, "messages"), { 
                        chatId: chatId, senderId: currentUser.uid, receiverId: receiverId, 
                        type: "audio", audioUrl: reader.result, createdAt: serverTimestamp() 
                    });
                } catch (err) { alert("Failed to send voice note."); }
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
            recordingTimer.innerText = `${Math.floor(diff/60).toString().padStart(2,'0')}:${(diff%60).toString().padStart(2,'0')}`;
        }, 1000);
    } catch (err) { alert("Mic Error: " + err.message); }
});

window.stopAndSendRecording = function() { if (mediaRecorder && isRecording) { mediaRecorder.stop(); isRecording = false; } };
window.cancelRecording = function() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.onstop = null; 
        mediaRecorder.stop();
        isRecording = false;
        clearInterval(timerInterval);
        if (currentStream) { currentStream.getTracks().forEach(track => track.stop()); currentStream = null; }
        recordingOverlay.classList.add('hidden');
        chatInputArea.style.display = 'flex';
    }
};
