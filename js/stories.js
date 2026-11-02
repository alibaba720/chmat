import { db } from "./firebase-config.js";
import { doc, deleteDoc, collection, query, onSnapshot, addDoc, updateDoc, arrayUnion, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const IMGBB_API_KEY = "432c4e1e55a011e0a4618ee53954a901"; 
let currentUser, currentUserData, myFriendsList;
let globalStories = [], currentStoryGroup = [], currentStoryIndex = 0, storyTimer = null;

export function initStories(user, userData, friends) {
    currentUser = user; currentUserData = userData; myFriendsList = friends || [];
    attachStoryUploadListener();
    renderStoriesRow([]); 
    loadStories();
}

window.openStoryChoiceModal = function() { document.getElementById('storyChoiceModal').classList.remove('hidden'); }
window.closeStoryChoiceModal = function() { document.getElementById('storyChoiceModal').classList.add('hidden'); }

window.openTextStatusModal = function() {
    closeStoryChoiceModal();
    document.getElementById('textStatusModal').classList.remove('hidden');
    document.getElementById('textStatusInput').value = '';
    document.getElementById('textStatusPreview').innerText = '';
    document.getElementById('textStatusInput').focus();
}
window.closeTextStatusModal = function() { document.getElementById('textStatusModal').classList.add('hidden'); }

document.getElementById('textStatusInput')?.addEventListener('input', (e) => {
    document.getElementById('textStatusPreview').innerText = e.target.value;
});

window.postTextStatus = async function() {
    const text = document.getElementById('textStatusInput').value.trim();
    if(!text) return;
    const progress = document.getElementById('storyUploadProgress');
    if(progress) progress.classList.remove('hidden');
    try {
        const colors = ['linear-gradient(45deg, #1a2a6c, #b21f1f, #fdbb2d)', 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)'];
        const bg = colors[Math.floor(Math.random() * colors.length)];
        await addDoc(collection(db, "stories"), {
            uid: currentUser.uid, username: currentUserData.username, profilePicUrl: currentUserData.profilePicUrl || "", 
            mediaUrl: text, bgColor: bg, type: 'text', duration: 10, viewers: [], createdAt: serverTimestamp()
        });
        alert("Status uploaded successfully!"); closeTextStatusModal(); loadStories();
    } catch(e) { alert("Error: " + e.message); }
    finally { if(progress) progress.classList.add('hidden'); }
}

function attachStoryUploadListener() {
    const uploadInput = document.getElementById('storyUploadInput');
    if(uploadInput) {
        uploadInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if(!file) return;
            const progress = document.getElementById('storyUploadProgress');
            if(progress) progress.classList.remove('hidden');
            try {
                let mediaUrl = "";
                const formData = new FormData(); formData.append("image", file);
                const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: formData });
                const data = await res.json();
                if(data.success) mediaUrl = data.data.url; else throw new Error("Image upload failed");
                await addDoc(collection(db, "stories"), {
                    uid: currentUser.uid, username: currentUserData.username, profilePicUrl: currentUserData.profilePicUrl || "", mediaUrl: mediaUrl,
                    type: 'image', duration: 10, viewers: [], createdAt: serverTimestamp()
                });
                alert("Story uploaded successfully!"); loadStories();
            } catch(err) { alert("Upload Error: " + err.message); } 
            finally { uploadInput.value = ''; if(progress) progress.classList.add('hidden'); }
        });
    }
}

function loadStories() {
    const q = query(collection(db, "stories"));
    onSnapshot(q, async (snapshot) => {
        let allStories = []; const now = Date.now();
        for (const doc of snapshot.docs) {
            const story = doc.data();
            const storyTime = story.createdAt ? story.createdAt.toMillis() : 0;
            if ((now - storyTime) > 24 * 60 * 60 * 1000) { await deleteDoc(doc.ref); continue; }
            if (story.uid === currentUser.uid || myFriendsList.includes(story.uid)) { allStories.push({ id: doc.id, ...story }); }
        }
        const grouped = {};
        allStories.forEach(story => {
            if (!grouped[story.uid]) grouped[story.uid] = { user: story, stories: [] };
            grouped[story.uid].stories.push(story);
        });
        globalStories = Object.values(grouped).sort((a,b) => { const tA = a.user.createdAt ? a.user.createdAt.toMillis() : 0; const tB = b.user.createdAt ? b.user.createdAt.toMillis() : 0; return tB - tA; });
        renderStoriesRow(globalStories);
    });
}

function renderStoriesRow(stories) {
    const container = document.getElementById('storiesContainer');
    if(!container) return;
    let html = '';
    const name = currentUserData && (currentUserData.displayName || currentUserData.username) ? (currentUserData.displayName || currentUserData.username) : "User";
    const myInitial = name.charAt(0).toUpperCase();
    const pic = currentUserData ? currentUserData.profilePicUrl : null;
    
    let myAvatar = "";
    if (pic && pic.trim() !== "") {
        myAvatar = `<img src="${pic}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else {
        myAvatar = `<div style="width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#222;font-weight:bold;color:#fff;">${myInitial}</div>`;
    }

    html += `<div class="story-item" onclick="openStoryChoiceModal()">
        <div class="story-ring">${myAvatar}<div class="story-add-btn">+</div></div>
        <span>Your Story</span>
    </div>`;

    stories.forEach(group => {
        if(group.user.uid === currentUser.uid) return; 
        const u = group.user;
        const initial = (u.username || "U").charAt(0).toUpperCase();
        const avatar = u.profilePicUrl ? `<img src="${u.profilePicUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : `<div style="width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#222;font-weight:bold;color:#fff;">${initial}</div>`;
        const hasViewed = group.stories.every(s => s.viewers && s.viewers.includes(currentUser.uid));
        const ringClass = hasViewed ? 'story-ring viewed' : 'story-ring';

        html += `<div class="story-item" onclick="openStoryViewer('${u.uid}')">
            <div class="${ringClass}">${avatar}</div>
            <span>${u.username}</span>
        </div>`;
    });

    html += `<div class="story-item" onclick="openAllSuggestions()">
        <div class="story-arrow-btn">›</div>
        <span>See All</span>
    </div>`;

    container.innerHTML = html;
}

window.openStoryViewer = function(uid) {
    const group = globalStories.find(g => g.user.uid === uid);
    if (!group) return;
    currentStoryGroup = group.stories; currentStoryIndex = 0;
    document.getElementById('storyViewerModal').classList.remove('hidden');
    document.getElementById('storyViewerName').innerText = group.user.username;
    const avatar = group.user.profilePicUrl ? `<img src="${group.user.profilePicUrl}" style="width:100%;height:100%;object-fit:cover;">` : `<div style="display:flex; align-items:center; justify-content:center; width:100%; height:100%; background:#333; font-weight:bold; color:#fff;">${group.user.username.charAt(0).toUpperCase()}</div>`;
    document.getElementById('storyViewerAvatar').innerHTML = avatar;
    showStory();
};

function showStory() {
    if (currentStoryIndex >= currentStoryGroup.length) { closeStoryViewer(); return; }
    const story = currentStoryGroup[currentStoryIndex];
    const mediaContainer = document.getElementById('storyViewerMedia');
    const progressBar = document.getElementById('storyProgress');

    progressBar.style.width = '0%';
    if (storyTimer) clearInterval(storyTimer);

    if (story.type === 'text') {
        mediaContainer.innerHTML = `<div style="width:100%; height:100%; display:flex; justify-content:center; align-items:center; background:${story.bgColor}; padding:20px; text-align:center; font-size:30px; font-weight:bold; color:white; word-break:break-word;">${story.mediaUrl}</div>`;
        let progress = 0;
        storyTimer = setInterval(() => {
            progress += 1; progressBar.style.width = progress + '%';
            if (progress >= 100) { clearInterval(storyTimer); nextStory(); }
        }, 100);
    } else {
        mediaContainer.innerHTML = `<img src="${story.mediaUrl}" style="max-width:100%; max-height:100%; object-fit:contain;">`;
        let progress = 0;
        storyTimer = setInterval(() => {
            progress += 1; progressBar.style.width = progress + '%';
            if (progress >= 100) { clearInterval(storyTimer); nextStory(); }
        }, 100);
    }

    if (story.uid !== currentUser.uid) {
        updateDoc(doc(db, "stories", story.id), { viewers: arrayUnion(currentUser.uid) }).catch(e => console.log(e));
    }
}

window.nextStory = function() { if (storyTimer) clearInterval(storyTimer); currentStoryIndex++; if (currentStoryIndex < currentStoryGroup.length) { showStory(); } else { closeStoryViewer(); } };
window.prevStory = function() { if (storyTimer) clearInterval(storyTimer); if (currentStoryIndex > 0) { currentStoryIndex--; showStory(); } };
window.closeStoryViewer = function() { if (storyTimer) clearInterval(storyTimer); document.getElementById('storyViewerMedia').innerHTML = ''; document.getElementById('storyViewerModal').classList.add('hidden'); };
