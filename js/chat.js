import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const receiverId = urlParams.get('uid');
const receiverName = urlParams.get('name');

const chatName = document.getElementById('chatName');
const chatAvatar = document.getElementById('chatAvatar');
const messagesContainer = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendMessageBtn');
const recordBtn = document.getElementById('recordBtn');

let currentUser = null;
let chatId = "";
let mediaRecorder;
let audioChunks = [];
let isRecording = false;

if (!receiverId || !receiverName) { window.location.href = 'app.html'; }
chatName.innerText = receiverName;

function getChatId(uid1, uid2) { return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`; }

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        chatId = getChatId(currentUser.uid, receiverId);
        loadMessages();
    } else { window.location.href = 'login.html'; }
});

function loadMessages() {
    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, where("chatId", "==", chatId));

    onSnapshot(q, (snapshot) => {
        let msgs = [];
        snapshot.forEach((doc) => { msgs.push({ id: doc.id, ...doc.data() }); });
        
        // Sort in JS (Oldest first)
        msgs.sort((a,b) => { return (a.createdAt ? a.createdAt.toMillis() : 0) - (b.createdAt ? b.createdAt.toMillis() : 0); });

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
    });
}

async function sendTextMessage() {
    const text = messageInput.value.trim();
    if (text === "" || !currentUser) return;
    messageInput.value = ""; 
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
    if (!isRecording) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            mediaRecorder.ondataavailable = event => { if (event.data.size > 0) audioChunks.push(event.data); };
            
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                recordBtn.style.color = "#ffd700"; 
                
                const formData = new FormData();
                formData.append("file", audioBlob, "voice.webm");

                try {
                    // 0x0.st Upload
                    const response = await fetch("https://0x0.st", { method: "POST", body: formData });
                    const audioUrl = await response.text(); 
                    
                    if (audioUrl && audioUrl.startsWith("https://")) {
                        await addDoc(collection(db, "messages"), { chatId: chatId, senderId: currentUser.uid, receiverId: receiverId, type: "audio", audioUrl: audioUrl.trim(), createdAt: serverTimestamp() });
                    } else { alert("Voice upload failed!"); }
                } catch (err) { alert("Error uploading voice."); }
                recordBtn.style.color = "#0095f6"; 
            };
            mediaRecorder.start();
            isRecording = true;
            recordBtn.style.color = "red"; 
            messageInput.disabled = true;
        } catch (err) { alert("Mic permission denied."); }
    } else {
        mediaRecorder.stop();
        isRecording = false;
        messageInput.disabled = false;
    }
});
