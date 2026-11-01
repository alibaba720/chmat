import { auth, db, authReady } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const receiverId = urlParams.get('uid');
const receiverName = urlParams.get('name');

const chatName = document.getElementById('chatName');
const chatAvatar = document.getElementById('chatAvatar');
const messagesContainer = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendMessageBtn');
const recordBtn = document.getElementById('recordBtn');
const recordingUI = document.getElementById('recordingUI');
const recordingTimer = document.getElementById('recordingTimer');
const chatInputArea = document.getElementById('chatInputArea');

let currentUser = null;
let chatId = "";
let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let timerInterval;
let startTime;

if (!receiverId || !receiverName) { window.location.href = 'app.html'; }
chatName.innerText = receiverName;

function getChatId(uid1, uid2) { return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`; }

authReady.then(() => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            chatId = getChatId(currentUser.uid, receiverId);
            loadMessages();
        } else { window.location.href = 'login.html'; }
    });
});

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

// --- VOICE RECORDING WITH UI ---
recordBtn.addEventListener('click', async () => {
    if (!isRecording) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            mediaRecorder.ondataavailable = event => { if (event.data.size > 0) audioChunks.push(event.data); };
            
            mediaRecorder.onstop = async () => {
                clearInterval(timerInterval);
                recordingUI.classList.add('hidden');
                chatInputArea.style.display = 'flex';
                recordBtn.style.display = 'flex';

                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                recordBtn.style.color = "#ffd700"; // Loading color
                
                const formData = new FormData();
                formData.append("file", audioBlob, "voice.webm");

                try {
                    const response = await fetch("https://tmpfiles.org/api/v1/upload", { method: "POST", body: formData });
                    const data = await response.json(); 
                    
                    if (data.status === "success") {
                        // TmpFiles direct download URL
                        let audioUrl = data.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
                        await addDoc(collection(db, "messages"), { 
                            chatId: chatId, senderId: currentUser.uid, receiverId: receiverId, 
                            type: "audio", audioUrl: audioUrl, createdAt: serverTimestamp() 
                        });
                    } else { 
                        alert("Voice upload failed. Try again."); 
                    }
                } catch (err) { 
                    console.error(err);
                    alert("Error uploading voice. Check internet."); 
                }
                recordBtn.style.color = "#0095f6"; 
            };
            
            mediaRecorder.start();
            isRecording = true;
            
            // UI Toggle
            recordingUI.classList.remove('hidden');
            chatInputArea.style.display = 'none'; // Hide normal input
            
            // Timer Start
            startTime = Date.now();
            recordingTimer.innerText = "0:00";
            timerInterval = setInterval(() => {
                const diff = Math.floor((Date.now() - startTime) / 1000);
                const mins = Math.floor(diff / 60).toString().padStart(2, '0');
                const secs = (diff % 60).toString().padStart(2, '0');
                recordingTimer.innerText = `${mins}:${secs}`;
            }, 1000);

        } catch (err) { 
            alert("Mic permission denied."); 
        }
    }
});

// Stop Recording Function
window.stopRecording = function() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
    }
}
