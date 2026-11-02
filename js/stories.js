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
                let duration = 5; 
                let type = 'image';

                if (file.type.startsWith('video/')) {
                    type = 'video';
                    duration = await getVideoDuration(file);
                    if(duration > 60) {
                        alert("Video must be 60 seconds or less.");
                        throw new Error("Video too long");
                    }
                    
                    // Video Upload via Puter.js
                    const puterFileName = "story_" + Date.now() + ".mp4";
                    const puterFile = new File([file], puterFileName, { type: 'video/mp4' });
                    
                    // Puter upload (timeout lagaya hai taake hang na ho)
                    const uploadPromise = puter.fs.write(puterFileName, puterFile);
                    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Network timeout")), 45000));
                    
                    const uploadedFile = await Promise.race([uploadPromise, timeoutPromise]);
                    mediaUrl = await puter.fs.get_url(uploadedFile.path);

                } else {
                    // Image Upload via ImgBB
                    const formData = new FormData();
                    formData.append("image", file);
                    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: formData });
                    const data = await res.json();
                    if(data.success) mediaUrl = data.data.url;
                    else throw new Error("ImgBB upload failed");
                }

                if(mediaUrl) {
                    await addDoc(collection(db, "stories"), {
                        uid: currentUser.uid, username: currentUserData.username,
                        profilePicUrl: currentUserData.profilePicUrl || "", mediaUrl: mediaUrl,
                        type: type, duration: Math.ceil(duration), viewers: [], createdAt: serverTimestamp()
                    });
                    alert("Story uploaded successfully!");
                }

            } catch(err) { 
                console.error(err); 
                alert("Upload Error: " + err.message); 
            } finally {
                // CHAHE UPLOAD FAIL HO YA PASS, LOADING SCREEN BAND HO GI
                uploadInput.value = ''; 
                if(progress) progress.classList.add('hidden');
            }
        });
    }
}

function getVideoDuration(file) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => { window.URL.revokeObjectURL(video.src); resolve(video.duration); };
        video.src = URL.createObjectURL(file);
    });
}

function loadStories() {
    const q = query(collection(db, "stories"));
    onSnapshot(q, async (snapshot) => {
        let allStories = [];
        const now = Date.now();
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
        globalStories = Object.values(grouped);
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
    const myAvatar = pic ? `<img src="${pic}">` : `<div style="width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#222;font-weight:bold;">${myInitial}</div>`;

    html += `<div class="story-item" onclick="document.getElementById('storyUploadInput').click()">
        <div class="story-ring">${myAvatar}<div class="story-add-btn">+</div></div>
        <span>Your Story</span>
    </div>`;

    stories.forEach(group => {
        const u = group.user;
        const initial = (u.username || "U").charAt(0).toUpperCase();
        const avatar = u.profilePicUrl ? `<img src="${u.profilePicUrl}">` : `<div style="width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#222;font-weight:bold;">${initial}</div>`;
        const hasViewed = group.stories.every(s => s.viewers && s.viewers.includes(currentUser.uid));
        const ringClass = hasViewed ? 'story-ring viewed' : 'story-ring';

        html += `<div class="story-item" onclick="openStoryViewer('${u.uid}')">
            <div class="${ringClass}">${avatar}</div>
            <span>${u.username}</span>
        </div>`;
    });
    container.innerHTML = html;
}

window.openStoryViewer = function(uid) {
    const group = globalStories.find(g => g.user.uid === uid);
    if (!group) return;
    currentStoryGroup = group.stories; currentStoryIndex = 0;
    document.getElementById('storyViewerModal').classList.remove('hidden');
    document.getElementById('storyViewerName').innerText = group.user.username;
    const avatar = group.user.profilePicUrl ? `<img src="${group.user.profilePicUrl}" style="width:100%;height:100%;object-fit:cover;">` : `<div style="display:flex; align-items:center; justify-content:center; width:100%; height:100%; background:#333; font-weight:bold;">${group.user.username.charAt(0).toUpperCase()}</div>`;
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

    if (story.type === 'video') {
        mediaContainer.innerHTML = `<video src="${story.mediaUrl}" autoplay playsinline style="max-width:100%; max-height:100%;"></video>`;
        const video = mediaContainer.querySelector('video');
        video.onended = nextStory;
        let progress = 0;
        storyTimer = setInterval(() => {
            if(video.duration) { progress = (video.currentTime / video.duration) * 100; progressBar.style.width = progress + '%'; }
        }, 50);
    } else {
        mediaContainer.innerHTML = `<img src="${story.mediaUrl}" style="max-width:100%; max-height:100%; object-fit:contain;">`;
        let progress = 0;
        storyTimer = setInterval(() => {
            progress += 2; progressBar.style.width = progress + '%';
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
