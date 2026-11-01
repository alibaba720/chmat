import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

let currentUser = null;
let currentUserData = null;
let selectedFriends = [];
const friendsListDiv = document.getElementById('friendsList');

function getAvatarHtml(profilePicUrl, initial) {
    if (profilePicUrl) { return `<img src="${profilePicUrl}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`; }
    return initial;
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
            currentUserData = docSnap.data();
            loadFriends(currentUserData.friends || []);
        }
    } else {
        window.location.href = 'login.html';
    }
});

async function loadFriends(friendUids) {
    if (friendUids.length === 0) {
        friendsListDiv.innerHTML = '<p style="color: #888;">You have no friends to add.</p>';
        return;
    }

    let html = '';
    for (const uid of friendUids) {
        const friendDoc = await getDoc(doc(db, "users", uid));
        if (friendDoc.exists()) {
            const data = friendDoc.data();
            const initial = (data.displayName || data.username).charAt(0).toUpperCase();
            const avatarHtml = getAvatarHtml(data.profilePicUrl, initial);
            
            html += `
              <div class="friend-select-item" id="friend-${uid}" onclick="toggleFriend('${uid}')" style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: #111; border-radius: 8px; cursor: pointer; border: 1px solid #222;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="width: 40px; height: 40px; border-radius: 50%; background: #333; display: flex; align-items: center; justify-content: center; font-weight: bold; overflow: hidden;">${avatarHtml}</div>
                  <div>
                    <div style="font-size: 15px; font-weight: 600;">${data.displayName || data.username}</div>
                    <div style="font-size: 12px; color: #888;">@${data.username}</div>
                  </div>
                </div>
                <div class="check-circle" style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid #555; display: flex; align-items: center; justify-content: center;"></div>
              </div>
            `;
        }
    }
    friendsListDiv.innerHTML = html;
}

window.toggleFriend = function(uid) {
    const item = document.getElementById(`friend-${uid}`);
    const circle = item.querySelector('.check-circle');
    
    if (selectedFriends.includes(uid)) {
        selectedFriends = selectedFriends.filter(id => id !== uid);
        item.style.borderColor = '#222';
        item.style.background = '#111';
        circle.style.background = 'transparent';
        circle.style.borderColor = '#555';
        circle.innerHTML = '';
    } else {
        selectedFriends.push(uid);
        item.style.borderColor = '#0095f6';
        item.style.background = '#1a1a1a';
        circle.style.background = '#0095f6';
        circle.style.borderColor = '#0095f6';
        circle.innerHTML = '✓';
    }
};

document.getElementById('createGroupBtn').addEventListener('click', async () => {
    const groupName = document.getElementById('groupNameInput').value.trim();
    
    if (!groupName) {
        alert("Please enter a group name!");
        return;
    }
    if (selectedFriends.length === 0) {
        alert("Please select at least 1 friend!");
        return;
    }

    const btn = document.getElementById('createGroupBtn');
    btn.innerText = "Creating...";
    btn.disabled = true;

    try {
        // Group create karna Firestore mein
        const groupData = {
            name: groupName,
            admin: currentUser.uid,
            members: [currentUser.uid, ...selectedFriends], // Apna aur doston ka UID
            createdAt: serverTimestamp(),
            lastMessage: "Group created",
            lastTime: serverTimestamp()
        };

        const groupRef = await addDoc(collection(db, "groups"), groupData);
        
        alert("Group created successfully!");
        // Group chat page par bhej dein (jo agle step mein banega)
        window.location.href = `group-chat.html?gid=${groupRef.id}&name=${groupName}`;

    } catch (error) {
        console.error(error);
        alert("Error creating group: " + error.message);
        btn.innerText = "Create";
        btn.disabled = false;
    }
});
