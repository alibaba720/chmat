import { initStories } from "./stories.js";
import { auth, db, authReady } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs, addDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, onSnapshot, increment } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const dropdownMenu = document.getElementById('dropdownMenu');
const navItems = document.querySelectorAll('.nav-item');
const OWNER_MOBILE = "03016631720"; 
let currentUser = null, currentUserData = null, myFriendsList = [];
let globalPosts = [], userCache = {}, mySentRequests = [];
let currentPostIdForComment = null, currentReplyTo = null, activePostIdForOptions = null; 
let isFirstLoad = true;

function getAvatarHtml(profilePicUrl, initial) {
    if (profilePicUrl) return `<img src="${profilePicUrl}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    return initial;
}

async function getUserProfile(uid) {
    if (userCache[uid]) return userCache[uid];
    try {
        const docSnap = await getDoc(doc(db, "users", uid));
        if (docSnap.exists()) { userCache[uid] = docSnap.data(); return userCache[uid]; }
    } catch(e) { console.log(e); }
    return null;
}

navItems.forEach(item => {
  item.addEventListener('click', () => {
    const tabId = item.getAttribute('data-tab');
    if (tabId === 'post') { window.location.href = 'post.html'; return; }
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    navItems.forEach(nav => nav.classList.remove('active'));
    document.getElementById(tabId).classList.remove('hidden');
    item.classList.add('active');
    if (tabId === 'chatTab') loadChatList();
  });
});

const notiBtn = document.getElementById('notiBtn');
if (notiBtn) { notiBtn.addEventListener('click', () => { 
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden')); 
    navItems.forEach(nav => nav.classList.remove('active')); 
    document.getElementById('notiTab').classList.remove('hidden'); 
    markNotificationsRead(); 
}); }

const backFromNoti = document.getElementById('backFromNoti');
if (backFromNoti) { backFromNoti.addEventListener('click', () => { 
    document.getElementById('notiTab').classList.add('hidden'); 
    document.getElementById('homeTab').classList.remove('hidden'); 
    document.querySelector('.nav-item[data-tab="homeTab"]').classList.add('active'); 
}); }

function timeAgo(date) {
    if (!date) return "Just now";
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000; if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000; if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400; if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600; if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60; if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
}
function createPostHTML(post, docId) {
    const isLiked = post.likes && post.likes.includes(currentUser.uid);
    const postDate = post.createdAt ? post.createdAt.toDate() : new Date();
    let privacyIcon = post.privacy === "Friends" ? "👥" : (post.privacy === "Only Me" ? "🔒" : "🌍");
    const authorData = userCache[post.uid] || post;
    const currentDp = authorData.profilePicUrl || "";
    const currentDisplayName = authorData.displayName || post.displayName || post.username;
    const initial = currentDisplayName.charAt(0).toUpperCase();
    const avatarHtml = getAvatarHtml(currentDp, initial);
    const likesCount = post.likes ? post.likes.length : 0;
    const commentsCount = post.commentCount ? post.commentCount : 0;
    const isMyPost = post.uid === currentUser.uid;
    let menuHtml = isMyPost ? `<button onclick="openPostOptions('${docId}')" style="background:none; border:none; color:#888; font-size:20px; cursor:pointer; margin-left:auto;">⋮</button>` : '';

    return `
      <div class="post-card">
        <div class="post-header" style="display:flex; justify-content:space-between; align-items:center;">
          <div onclick="window.location.href='profile.html?uid=${post.uid}'" style="display:flex; align-items:center; cursor:pointer; flex:1;">
            <div class="post-avatar">${avatarHtml}</div>
            <div class="post-user-info">
              <div class="post-display-name">${currentDisplayName}</div>
              <div class="post-meta-info">${timeAgo(postDate)} • <span class="post-privacy-icon">${privacyIcon}</span></div>
            </div>
          </div>
          ${menuHtml}
        </div>
        ${post.feeling ? `<span class="post-feeling">is feeling ${post.feeling}</span>` : ''}
        ${post.text ? `<div class="post-text">${post.text}</div>` : ''}
        ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image" alt="Post Image">` : ''}
        <div style="padding: 0 16px 10px 16px; font-size: 13px; color: #888; display: flex; gap: 15px;">
            <span><b style="color:#fff;">${likesCount}</b> Likes</span>
            <span><b style="color:#fff;">${commentsCount}</b> Comments</span>
        </div>
        <div class="post-actions">
          <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${docId}', ${isLiked}, '${post.uid}')">${isLiked ? '❤️' : '🤍'} Like</button>
          <button class="action-btn" onclick="openCommentModal('${docId}')">💬 Comment</button>
        </div>
      </div>
    `;
}

async function loadFeed() {
    const feedContainer = document.getElementById('feedContainer');
    try {
        const q = query(collection(db, "posts"));
        onSnapshot(q, async (snapshot) => {
            globalPosts = []; let uidsToFetch = new Set();
            snapshot.forEach((doc) => { 
                const post = doc.data(); 
                globalPosts.push({ id: doc.id, ...post }); 
                uidsToFetch.add(post.uid); 
            });
            await Promise.all(Array.from(uidsToFetch).map(uid => getUserProfile(uid)));
            if (isFirstLoad) { globalPosts.sort(() => Math.random() - 0.5); isFirstLoad = false; } 
            else { globalPosts.sort((a,b) => (b.createdAt ? b.createdAt.toMillis() : 0) - (a.createdAt ? a.createdAt.toMillis() : 0)); }
            
            let html = '';
            globalPosts.forEach((post) => {
                let canSee = false;
                if (post.privacy === "Public") canSee = true;
                else if (post.uid === currentUser.uid) canSee = true;
                else if (post.privacy === "Friends" && myFriendsList.includes(post.uid)) canSee = true;
                if (canSee) { html += createPostHTML(post, post.id); }
            });
            feedContainer.innerHTML = html !== '' ? html : '<div class="empty-feed">No posts to show.</div>';
            loadMyPosts();
        }, (error) => { feedContainer.innerHTML = `<p style="color: red; text-align: center; margin-top: 20px;">Feed Error: ${error.message}</p>`; });
    } catch (error) { feedContainer.innerHTML = `<p style="color: red; text-align: center; margin-top: 20px;">Error: ${error.message}</p>`; }
}

function loadMyPosts() {
  const photosContainer = document.getElementById('myPhotosContainer');
  const statusContainer = document.getElementById('myStatusContainer');
  if (!photosContainer || !statusContainer) return;

  let photosHtml = '';
  let statusHtml = '';

  globalPosts.forEach(post => { 
      if (post.uid === currentUser.uid) {
          if (post.imageUrl) {
              photosHtml += `<div class="ig-grid-item" onclick="openViewPost('${post.id}')"><img src="${post.imageUrl}"></div>`;
          } else if (post.text) {
              statusHtml += `<div style="background: #1a1a1a; padding: 16px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #333;">${post.text}</div>`;
          }
      } 
  });

  photosContainer.innerHTML = photosHtml !== '' ? photosHtml : '<p style="color:#888; grid-column: 1 / -1; text-align:center; padding:20px;">No photos yet.</p>';
  statusContainer.innerHTML = statusHtml !== '' ? statusHtml : '<p style="color:#888; text-align:center; padding:20px;">No text statuses yet.</p>';
}

window.openPostOptions = function(postId) { activePostIdForOptions = postId; document.getElementById('postOptionsModal').style.display = 'flex'; }
window.closePostOptions = function() { activePostIdForOptions = null; document.getElementById('postOptionsModal').style.display = 'none'; }
window.changePrivacyAction = async function(newPrivacy) { if (!activePostIdForOptions) return; try { await updateDoc(doc(db, "posts", activePostIdForOptions), { privacy: newPrivacy }); closePostOptions(); } catch(e) { alert("Error: " + e.message); } }
window.deletePostAction = async function() { if (!activePostIdForOptions) return; if(confirm("Delete this post?")) { try { await deleteDoc(doc(db, "posts", activePostIdForOptions)); closePostOptions(); } catch(e) { alert("Error: " + e.message); } } }

window.toggleLike = async function(postId, isCurrentlyLiked, postUid) {
    try {
        const postRef = doc(db, "posts", postId);
        if (isCurrentlyLiked) { await updateDoc(postRef, { likes: arrayRemove(currentUser.uid) }); }
        else { await updateDoc(postRef, { likes: arrayUnion(currentUser.uid) }); if(postUid !== currentUser.uid) { await addDoc(collection(db, "notifications"), { receiverId: postUid, senderId: currentUser.uid, senderUsername: currentUserData.username, type: "like", postId: postId, read: false, createdAt: serverTimestamp() }); } }
    } catch (error) { console.error(error); }
}
window.openCommentModal = function(postId) { currentPostIdForComment = postId; const modal = document.getElementById('commentModal'); if(modal) { modal.style.display = 'flex'; document.getElementById('commentInput').value = ''; cancelReply(); loadComments(postId); } }
window.closeCommentModal = function() { const modal = document.getElementById('commentModal'); if(modal) { modal.style.display = 'none'; } currentPostIdForComment = null; cancelReply(); }
window.cancelReply = function() { currentReplyTo = null; const ind = document.getElementById('replyIndicator'); if(ind) ind.style.display = 'none'; const inp = document.getElementById('commentInput'); if(inp) inp.placeholder = "Add a comment..."; }
window.setReply = function(commentId, username) { currentReplyTo = { id: commentId, username: username }; document.getElementById('replyIndicator').style.display = 'flex'; document.getElementById('replyUsernameText').innerText = "@" + username; document.getElementById('commentInput').placeholder = "Reply to @" + username + "..."; document.getElementById('commentInput').focus(); }

function loadComments(postId) {
    const commentList = document.getElementById('commentList'); if(!commentList) return;
    commentList.innerHTML = '<p style="text-align:center; color:#888;">Loading comments...</p>';
    const q = query(collection(db, "posts", postId, "comments"));
    onSnapshot(q, (snapshot) => {
        updateDoc(doc(db, "posts", postId), { commentCount: snapshot.size }).catch(e=>console.log(e));
        if (snapshot.empty) { commentList.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px;">No comments yet.</p>'; return; }
        let allComments = []; snapshot.forEach((doc) => { allComments.push({ id: doc.id, ...doc.data() }); });
        allComments.sort((a,b) => { return (a.createdAt ? a.createdAt.toMillis() : 0) - (b.createdAt ? b.createdAt.toMillis() : 0); });
        const topLevel = allComments.filter(c => !c.parentId); const replies = allComments.filter(c => c.parentId);
        let html = '';
        topLevel.forEach((comment) => {
            const initial = (comment.displayName || comment.username).charAt(0).toUpperCase(); const avatarHtml = getAvatarHtml(comment.profilePicUrl, initial); const cDate = comment.createdAt ? comment.createdAt.toDate() : new Date();
            const commentReplies = replies.filter(r => r.parentId === comment.id); let repliesHtml = '';
            if (commentReplies.length > 0) {
                repliesHtml += `<div class="replies-container">`;
                commentReplies.forEach(reply => {
                    const rInitial = (reply.displayName || reply.username).charAt(0).toUpperCase(); const rAvatarHtml = getAvatarHtml(reply.profilePicUrl, rInitial); const rDate = reply.createdAt ? reply.createdAt.toDate() : new Date();
                    repliesHtml += `<div class="reply-item"><div class="reply-avatar" onclick="window.location.href='profile.html?uid=${reply.uid}'" style="cursor:pointer;">${rAvatarHtml}</div><div class="comment-body"><div class="comment-content"><span class="comment-username" onclick="window.location.href='profile.html?uid=${reply.uid}'" style="cursor:pointer;">${reply.username}</span> ${reply.text}</div><div class="comment-footer"><span>${timeAgo(rDate)}</span></div></div></div>`;
                });
                repliesHtml += `</div>`;
            }
            html += `<div class="comment-item"><div class="comment-avatar" onclick="window.location.href='profile.html?uid=${comment.uid}'" style="cursor:pointer;">${avatarHtml}</div><div class="comment-body"><div class="comment-content"><span class="comment-username" onclick="window.location.href='profile.html?uid=${comment.uid}'" style="cursor:pointer;">${comment.username}</span> ${comment.text}</div><div class="comment-footer"><span>${timeAgo(cDate)}</span><span class="reply-btn" onclick="setReply('${comment.id}', '${comment.username}')">Reply</span></div>${repliesHtml}</div></div>`;
        });
        commentList.innerHTML = html; commentList.scrollTop = commentList.scrollHeight;
    });
}

const sendCommentBtn = document.getElementById('sendCommentBtn');
if(sendCommentBtn) {
    sendCommentBtn.addEventListener('click', async () => {
        const input = document.getElementById('commentInput'); const text = input.value.trim();
        if (!text || !currentPostIdForComment) return;
        input.value = ''; 
        try {
            const commentData = { uid: currentUser.uid, username: currentUserData.username, displayName: currentUserData.displayName || currentUserData.username, profilePicUrl: currentUserData.profilePicUrl || "", text: text, createdAt: serverTimestamp() };
            if (currentReplyTo) { commentData.parentId = currentReplyTo.id; commentData.parentUsername = currentReplyTo.username; }
            await addDoc(collection(db, "posts", currentPostIdForComment, "comments"), commentData);
            await updateDoc(doc(db, "posts", currentPostIdForComment), { commentCount: increment(1) });
            cancelReply(); 
        } catch (error) { alert("Failed to post comment: " + error.message); }
    });
}

const commentInput = document.getElementById('commentInput');
if(commentInput) { commentInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') document.getElementById('sendCommentBtn').click(); }); }

authReady.then(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      try {
        let docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          currentUserData = docSnap.data();
        } else {
          // Default profile for new users to prevent crash
          currentUserData = {
             uid: user.uid,
             username: user.email ? user.email.split('@')[0] : (user.phoneNumber ? "user_" + user.phoneNumber.slice(-4) : "user_" + user.uid.substring(0,5)),
             displayName: "New User",
             friends: [],
             bio: "Hello, I am using CHMAT!"
          };
          await setDoc(doc(db, "users", user.uid), currentUserData);
        }
        
        myFriendsList = currentUserData.friends || []; 
        userCache[currentUser.uid] = currentUserData;
        const displayName = currentUserData.displayName || currentUserData.username || "User"; 
        const bio = currentUserData.bio || "No bio yet."; 
        const initial = displayName.charAt(0).toUpperCase();
        
        let cleanDbMobile = currentUserData.mobile ? String(currentUserData.mobile).replace(/^\+?92/, '0').replace(/[^0-9]/g, '') : "";
        if (cleanDbMobile === OWNER_MOBILE) { 
            const adminBtn = document.getElementById('adminPanelBtn');
            if (adminBtn) adminBtn.classList.remove('hidden'); 
        }
        
        const myPostsSnap = await getDocs(query(collection(db, "posts"), where("uid", "==", user.uid)));
        const avatarHtml = getAvatarHtml(currentUserData.profilePicUrl, initial);
        
        const profileInfo = document.getElementById('profileInfoContainer');
        if(profileInfo) {
            profileInfo.innerHTML = `
              <div class="ig-top-bar">
                <div class="ig-username">${currentUserData.username || "unknown"} <span style="font-size:12px;">▼</span></div>
                <div class="ig-menu-icon" id="menuBtn">☰</div>
              </div>
              <div class="ig-profile-header">
                <div class="ig-dp-container">
                  <div class="ig-dp-img" style="display:flex; justify-content:center; align-items:center; background:#333; font-size:32px; overflow:hidden;">${avatarHtml}</div>
                  <div class="ig-dp-add" onclick="window.location.href='edit-profile.html'">+</div>
                </div>
                <div class="ig-stats">
                  <div class="ig-stat-item"><span class="ig-stat-num">${myPostsSnap.size}</span>photos</div>
                  <div class="ig-stat-item" onclick="window.openFriendsModal()" style="cursor:pointer;"><span class="ig-stat-num">${myFriendsList.length}</span>friends</div>
                  <div class="ig-stat-item"><span class="ig-stat-num">0</span>following</div>
                </div>
              </div>
              <div class="ig-bio-section">
                <div class="ig-name">${displayName}</div>
                <div class="ig-text">${bio}</div>
              </div>
              <div class="ig-action-btns">
                <button class="ig-btn" id="editProfileBtn">Edit profile</button>
                <button class="ig-btn" onclick="navigator.clipboard.writeText(window.location.href); alert('Profile link copied!')">Share profile</button>
              </div>
              <div class="ig-tabs">
                <div class="ig-tab" id="tabStatus" onclick="switchProfileTab('status')">STATUS</div>
                <div class="ig-tab active" id="tabPhotos" onclick="switchProfileTab('photos')">PHOTOS</div>
              </div>
              <div id="myPhotosContainer" class="ig-grid"></div>
              <div id="myStatusContainer" style="display: none; padding: 16px; color: #fff;"></div>
            `;
            
            document.getElementById('editProfileBtn').addEventListener('click', () => window.location.href = 'edit-profile.html');
            
            const menuBtn = document.getElementById('menuBtn');
            if (menuBtn) { 
                menuBtn.addEventListener('click', (e) => { 
                    e.stopPropagation(); 
                    dropdownMenu.classList.toggle('hidden'); 
                }); 
                const settingsBtn = document.getElementById('settingsBtn'); 
                if(settingsBtn) settingsBtn.onclick = () => window.location.href = 'settings.html'; 
                document.addEventListener('click', (e) => { 
                    if (!dropdownMenu.contains(e.target) && e.target !== menuBtn) dropdownMenu.classList.add('hidden'); 
                }); 
            }
        }
        
        // AB YEH HAMESHA CHALEGA, CHAHE NAYA USER HO YA PURANA
        loadMySentRequests(); 
        loadFeed(); 
        try { initStories(currentUser, currentUserData, myFriendsList); } catch(e) { console.error("Stories Error:", e); }
        loadSuggestions(); 
        loadNotifications();
        
      } catch(e) { 
          console.error(e);
          const feed = document.getElementById('feedContainer');
          if(feed) feed.innerHTML = `<p style="color:red; text-align:center;">Error: ${e.message}</p>`; 
      }
    } else { window.location.href = 'login.html'; }
  });
});

window.openFriendsModal = async function() {
    const modal = document.getElementById('friendsModal'); const container = document.getElementById('friendsListContainer'); if(!modal || !container) return;
    modal.style.display = 'flex'; container.innerHTML = '<p style="text-align:center; color:#888;">Loading friends...</p>';
    if(myFriendsList.length === 0) { container.innerHTML = '<p style="text-align:center; color:#888;">No friends yet.</p>'; return; }
    let html = '';
    await Promise.all(myFriendsList.map(async (friendId) => {
        const data = await getUserProfile(friendId);
        if(data) {
            const initial = (data.displayName || data.username).charAt(0).toUpperCase(); const avatarHtml = getAvatarHtml(data.profilePicUrl, initial);
            html += `<div class="user-result" style="padding: 10px 0; border-bottom: 1px solid #222;"><div class="user-info-left" onclick="window.location.href='profile.html?uid=${data.uid}'" style="cursor:pointer; display:flex; align-items:center; gap:10px;"><div class="user-avatar-small">${avatarHtml}</div><div class="user-details"><h4>${data.displayName || data.username}</h4><p>@${data.username}</p></div></div><div style="position:relative;"><button onclick="toggleFriendMenu('${data.uid}', event)" style="background:none; border:none; color:#888; font-size:20px; cursor:pointer;">⋮</button><div id="friend-menu-${data.uid}" style="display:none; position:absolute; right:30px; top:0; background:#1a1a1a; border:1px solid #333; border-radius:8px; z-index:100; width:140px; overflow:hidden;"><div onclick="unfriendFromList('${data.uid}')" style="padding:12px; color:#fff; font-size:14px; cursor:pointer; border-bottom:1px solid #333;">Unfriend</div><div onclick="blockUser('${data.uid}')" style="padding:12px; color:#ff3b30; font-size:14px; cursor:pointer;">Block</div></div></div></div>`;
        }
    }));
    container.innerHTML = html;
}

window.closeFriendsModal = function() { document.getElementById('friendsModal').style.display = 'none'; }
window.toggleFriendMenu = function(uid, event) { event.stopPropagation(); document.querySelectorAll('[id^="friend-menu-"]').forEach(el => el.style.display = 'none'); const menu = document.getElementById('friend-menu-' + uid); if(menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none'; }
document.addEventListener('click', () => { document.querySelectorAll('[id^="friend-menu-"]').forEach(el => el.style.display = 'none'); });
window.unfriendFromList = async function(friendId) { if(!confirm("Unfriend this user?")) return; try { await updateDoc(doc(db, "users", currentUser.uid), { friends: arrayRemove(friendId) }); await updateDoc(doc(db, "users", friendId), { friends: arrayRemove(currentUser.uid) }); myFriendsList = myFriendsList.filter(id => id !== friendId); document.querySelector('.profile-stats .stat-item:nth-child(2) span').innerText = myFriendsList.length; openFriendsModal(); } catch(e) { alert("Error: " + e.message); } }
window.blockUser = async function(friendId) { if(!confirm("Block this user?")) return; try { await updateDoc(doc(db, "users", currentUser.uid), { friends: arrayRemove(friendId) }); await updateDoc(doc(db, "users", friendId), { friends: arrayRemove(currentUser.uid) }); await updateDoc(doc(db, "users", currentUser.uid), { blocked: arrayUnion(friendId) }); myFriendsList = myFriendsList.filter(id => id !== friendId); document.querySelector('.profile-stats .stat-item:nth-child(2) span').innerText = myFriendsList.length; openFriendsModal(); alert("User blocked."); } catch(e) { alert("Error: " + e.message); } }

function loadMySentRequests() {
    const qSent = query(collection(db, "friend_requests"), where("senderId", "==", currentUser.uid));
    onSnapshot(qSent, (snapshot) => { mySentRequests = []; snapshot.forEach(doc => { if(doc.data().status === "pending") mySentRequests.push({ id: doc.id, ...doc.data() }); }); });
}
let allNotifications = []; let deleteTimeouts = {}; 
function loadNotifications() {
  const qReq = query(collection(db, "friend_requests"), where("receiverId", "==", currentUser.uid));
  onSnapshot(qReq, (snapReq) => {
      let reqs = []; snapReq.forEach(doc => { if(doc.data().status === "pending") reqs.push({ id: doc.id, type: 'request', ...doc.data() }); });
      const qNoti = query(collection(db, "notifications"), where("receiverId", "==", currentUser.uid));
      onSnapshot(qNoti, (snapNoti) => {
          let otherNotis = []; snapNoti.forEach(doc => { otherNotis.push({ id: doc.id, type: doc.data().type, ...doc.data() }); });
          let combined = [...reqs, ...otherNotis]; combined.sort((a,b) => { return (b.createdAt ? b.createdAt.toMillis() : 0) - (a.createdAt ? a.createdAt.toMillis() : 0); });
          allNotifications = combined; renderNotifications();
      });
  });
}

function renderNotifications() {
    const notiList = document.getElementById('notiList'); const notiDot = document.getElementById('notiDot'); const notiCount = document.getElementById('notiCount');
    let unreadCount = allNotifications.filter(n => {
        if (n.type === 'request') return true; // Saari pending requests unread hain
        return n.read === false;
    }).length;
    if(unreadCount > 0) { notiDot.classList.remove('hidden'); notiCount.innerText = unreadCount; notiCount.classList.remove('hidden'); } else { notiDot.classList.add('hidden'); notiCount.classList.add('hidden'); }
    if(allNotifications.length === 0) { notiList.innerHTML = '<p style="text-align: center; color: #888; margin-top: 20px;">No notifications.</p>'; return; }
    let html = '';
    allNotifications.forEach(n => {
        const initial = n.senderUsername.charAt(0).toUpperCase(); const avatar = getAvatarHtml("", initial);
        let content = '';
        if(n.type === 'request') { content = `<div class="noti-text"><b>@${n.senderUsername}</b> sent you a friend request.</div><div class="noti-btns"><button class="btn-accept" onclick="acceptRequest('${n.id}', '${n.senderId}', '${n.senderUsername}')">Accept</button><button class="btn-reject" onclick="rejectRequest('${n.id}')">Delete</button></div>`; } 
        else if (n.type === 'like') { content = `<div class="noti-text"><b>@${n.senderUsername}</b> liked your post.</div>`; } 
        else if (n.type === 'comment') { content = `<div class="noti-text"><b>@${n.senderUsername}</b> commented: "${n.text}"</div>`; } 
        else if (n.type === 'friend_accept') { content = `<div class="noti-text"><b>@${n.senderUsername}</b> accepted your friend request.</div>`; }
        html += `<div class="noti-card" id="noti-${n.id}" data-id="${n.id}" data-original='${btoa(unescape(encodeURIComponent(content)))}' style="display:flex; align-items:center; padding:12px 16px; border-bottom:1px solid #222;"><div class="user-avatar-small">${avatar}</div>${content}</div>`;
    });
    notiList.innerHTML = html; attachSwipeListeners();
}

function attachSwipeListeners() {
    document.querySelectorAll('.noti-card').forEach(card => {
        let startX = 0; let currentX = 0;
        card.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; card.style.transition = 'none'; });
        card.addEventListener('touchmove', (e) => { currentX = e.touches[0].clientX - startX; if (currentX < 0) card.style.transform = `translateX(${currentX}px)`; });
        card.addEventListener('touchend', () => {
            card.style.transition = 'transform 0.2s ease-out';
            if (currentX < -80) { card.style.transform = `translateX(0)`; activateInlineUndo(card); } else { card.style.transform = `translateX(0)`; }
        });
    });
}

function activateInlineUndo(card) {
    const notiId = card.getAttribute('data-id');
    card.classList.add('noti-deleted-state'); card.innerHTML = `Notification deleted <span class="undo-btn" onclick="undoInlineDelete('${notiId}', this)">UNDO</span>`;
    deleteTimeouts[notiId] = setTimeout(async () => {
        try { const reqSnap = await getDoc(doc(db, "friend_requests", notiId)); if(reqSnap.exists()) { await deleteDoc(doc(db, "friend_requests", notiId)); } else { await deleteDoc(doc(db, "notifications", notiId)); } } catch(e) { console.log("Error deleting noti: ", e); }
    }, 4000); 
}

window.undoInlineDelete = function(notiId, btnElement) {
    if(deleteTimeouts[notiId]) { clearTimeout(deleteTimeouts[notiId]); delete deleteTimeouts[notiId]; }
    const card = document.getElementById(`noti-${notiId}`);
    if(card) {
        card.classList.remove('noti-deleted-state');
        const originalContent = decodeURIComponent(escape(atob(card.getAttribute('data-original'))));
        const initial = originalContent.match(/@(\w+)/) ? originalContent.match(/@(\w+)/)[1].charAt(0).toUpperCase() : 'U';
        card.innerHTML = `<div class="user-avatar-small">${getAvatarHtml("", initial)}</div>${originalContent}`;
    }
}

async function markNotificationsRead() {
    const qNoti = query(collection(db, "notifications"), where("receiverId", "==", currentUser.uid), where("read", "==", false));
    const snap = await getDocs(qNoti); snap.forEach(async (docSnap) => { await updateDoc(doc(db, "notifications", docSnap.id), { read: true }); });
}

window.acceptRequest = async function(reqId, senderId, senderUsername) {
  try { await deleteDoc(doc(db, "friend_requests", reqId)); await updateDoc(doc(db, "users", currentUser.uid), { friends: arrayUnion(senderId) }); await updateDoc(doc(db, "users", senderId), { friends: arrayUnion(currentUser.uid) }); await addDoc(collection(db, "notifications"), { receiverId: senderId, senderId: currentUser.uid, senderUsername: currentUserData.username, type: "friend_accept", read: false, createdAt: serverTimestamp() }); } catch (error) { console.error("Accept Error:", error); }
};

window.rejectRequest = async function(reqId) { try { await deleteDoc(doc(db, "friend_requests", reqId)); } catch (error) { console.error(error); } };

async function loadChatList() {
  const chatList = document.getElementById('chatList'); if (!chatList) return;
  try {
    const userDoc = await getDoc(doc(db, "users", currentUser.uid)); if (userDoc.exists()) myFriendsList = userDoc.data().friends || [];
    let html = '';

    // Fetch and Display Groups
    try {
        const qGroups = query(collection(db, "groups"), where("members", "array-contains", currentUser.uid));
        const snapGroups = await getDocs(qGroups);
        snapGroups.forEach((docSnap) => {
            const group = docSnap.data();
            const groupInitial = group.name.charAt(0).toUpperCase();
            const groupAvatar = `<div style="width:100%; height:100%; border-radius:50%; background:#0095f6; display:flex; justify-content:center; align-items:center; font-weight:bold; color:#fff;">${groupInitial}</div>`;
            html += `<div class="user-result" onclick="window.location.href='group-chat.html?gid=${docSnap.id}&name=${encodeURIComponent(group.name)}'" style="cursor:pointer;"><div class="user-info-left"><div class="user-avatar-small">${groupAvatar}</div><div class="user-details"><h4>${group.name} <span style="font-size:10px; color:#0095f6; font-weight:bold;">GROUP</span></h4><p style="color:#888;">Tap to open</p></div></div></div>`;
        });
    } catch(e) { console.error("Group fetch error", e); }

    if (myFriendsList.length > 0) {
        await Promise.all(myFriendsList.map(async (friendId) => {
          const data = await getUserProfile(friendId);
          if (data) { const initial = (data.displayName || data.username).charAt(0).toUpperCase(); const avatarHtml = getAvatarHtml(data.profilePicUrl, initial); html += `<div class="user-result" onclick="window.location.href='chat.html?uid=${data.uid}&name=${data.username}'"><div class="user-info-left"><div class="user-avatar-small">${avatarHtml}</div><div class="user-details"><h4>${data.displayName || data.username}</h4><p>@${data.username}</p></div></div></div>`; }
        }));
    }
    chatList.innerHTML = html !== '' ? html : '<p style="text-align: center; color: #888; margin-top: 20px;">No chats yet.</p>';
  } catch (error) { chatList.innerHTML = '<p style="text-align: center; color: red;">Error loading chats.</p>'; }
}

const searchInput = document.getElementById('searchInput'); const searchResults = document.getElementById('searchResults');
if (searchInput && searchResults) {
  searchInput.addEventListener('input', async (e) => {
    const searchTerm = e.target.value.trim().toLowerCase(); if (searchTerm.length < 2) { searchResults.innerHTML = '<p style="text-align: center; color: #888; margin-top: 20px;">Type at least 2 letters...</p>'; return; }
    searchResults.innerHTML = '';
    try {
      const querySnapshot = await getDocs(collection(db, "users")); 
      let html = '';
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.uid !== currentUser.uid && data.username.includes(searchTerm)) { 
          const initial = (data.displayName || data.username).charAt(0).toUpperCase(); const avatarHtml = getAvatarHtml(data.profilePicUrl, initial); 
          let btnHtml = '';
          if (myFriendsList.includes(data.uid)) { btnHtml = `<button class="add-friend-btn" style="background:#262626; color:#fff;" onclick="window.location.href='chat.html?uid=${data.uid}&name=${data.username}'">Message</button>`; } else {
              const existingReq = mySentRequests.find(r => r.receiverId === data.uid);
              if(existingReq) { btnHtml = `<button class="add-friend-btn" style="background:#333; color:#ff3b30;" onclick="cancelFriendRequest('${existingReq.id}', this)">Cancel</button>`; } else { btnHtml = `<button class="add-friend-btn" onclick="sendRequest('${data.uid}', '${data.username}', this)">Add Friend</button>`; }
          }
          html += `<div class="user-result"><div class="user-info-left" onclick="window.location.href='profile.html?uid=${data.uid}'" style="cursor:pointer;"><div class="user-avatar-small">${avatarHtml}</div><div class="user-details"><h4>${data.displayName || data.username}</h4><p>@${data.username}</p></div></div><div style="display:flex; gap:8px; align-items:center;">${btnHtml}<button onclick="reportProfile('${data.uid}', '${data.username}')" style="background:none; border:none; color:#888; font-size:20px; cursor:pointer;">⋮</button></div></div>`; 
        }
      });
      searchResults.innerHTML = html !== '' ? html : '<p style="text-align: center; color: #888; margin-top: 20px;">No user found.</p>';
    } catch (error) { searchResults.innerHTML = '<p style="text-align: center; color: red;">Error.</p>'; }
  });
}

window.reportProfile = async function(targetUid, targetUsername) {
    if(targetUid === currentUser.uid) { alert("Aap apni profile report nahi kar sakte."); return; }
    let reason = prompt("Report @"+targetUsername+"\n\nChoose Reason:\n1. Fake Account\n2. Harassment\n3. Nudity\n4. Spam");
    if (reason && reason.trim() !== "") { try { await addDoc(collection(db, "reports"), { type: "profile", targetId: targetUid, targetUsername: targetUsername, reporterId: currentUser.uid, reporterUsername: currentUserData.username, reason: reason, status: "pending", createdAt: serverTimestamp() }); alert("Profile reported!"); } catch(e) { alert("Error: " + e.message); } }
}
window.sendRequest = async function(receiverId, receiverUsername, btnElement) {
    btnElement.innerText = "Sending..."; btnElement.disabled = true;
    try { await addDoc(collection(db, "friend_requests"), { senderId: currentUser.uid, senderUsername: currentUserData.username, receiverId: receiverId, receiverUsername: receiverUsername, status: "pending", createdAt: serverTimestamp() }); btnElement.innerText = "Requested"; btnElement.style.background = "#333"; } catch (error) { btnElement.innerText = "Add Friend"; btnElement.disabled = false; }
}
window.cancelFriendRequest = async function(requestId, btnElement) {
    if(!confirm("Cancel this friend request?")) return;
    btnElement.innerText = "Cancelling...";
    try { await deleteDoc(doc(db, "friend_requests", requestId)); btnElement.innerText = "Add Friend"; btnElement.style.background = "#0095f6"; } catch(e) { alert("Error: " + e.message); btnElement.innerText = "Cancel"; }
}
const adminPanelBtn = document.getElementById('adminPanelBtn'); if (adminPanelBtn) { adminPanelBtn.addEventListener('click', () => window.location.href = 'admin.html'); }
const logoutBtn = document.getElementById('logoutBtn'); if (logoutBtn) { logoutBtn.addEventListener('click', () => signOut(auth).then(() => window.location.href = 'login.html')); }

// --- SUGGESTIONS LOGIC (Updated) ---

window.openAllSuggestions = function() { document.getElementById('allSuggestionsModal').classList.remove('hidden'); }
window.closeAllSuggestions = function() { document.getElementById('allSuggestionsModal').classList.add('hidden'); }

// --- SUGGESTIONS LOGIC (Full Page only) ---
async function loadSuggestions() {
    const fullContainer = document.getElementById('allSuggestionsList');
    if(!fullContainer) return;

    try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        let suggestions = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.uid !== currentUser.uid && !myFriendsList.includes(data.uid)) {
                suggestions.push(data);
            }
        });

        let fullHtml = '';
        suggestions.forEach((user) => {
            const initial = (user.displayName || user.username).charAt(0).toUpperCase();
            const avatar = user.profilePicUrl ? `<img src="${user.profilePicUrl}" style="width:100%;height:100%;object-fit:cover;">` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#fff;">${initial}</div>`;
            
            fullHtml += `
                <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:10px; border-bottom:1px solid #222;">
                    <div style="display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="window.location.href='profile.html?uid=${user.uid}'">
                        <div style="width:50px; height:50px; border-radius:50%; overflow:hidden; background:#333;">${avatar}</div>
                        <div>
                            <h4 style="margin:0; font-size:15px; color:#fff;">${user.displayName || user.username}</h4>
                            <p style="margin:0; font-size:13px; color:#888;">@${user.username}</p>
                        </div>
                    </div>
                    <button onclick="sendRequest('${user.uid}', '${user.username}', this)" style="background:#0095f6; color:#fff; border:none; padding:6px 15px; border-radius:6px; font-weight:bold;">Add Friend</button>
                </div>
            `;
        });

        if(fullHtml === '') fullHtml = '<p style="color:#888; text-align:center;">No suggestions available.</p>';
        fullContainer.innerHTML = fullHtml;

    } catch (error) {
        console.log("Suggestion error:", error);
    }
}

window.openAllSuggestions = function() { document.getElementById('allSuggestionsModal').classList.remove('hidden'); }
window.closeAllSuggestions = function() { document.getElementById('allSuggestionsModal').classList.add('hidden'); }

window.switchProfileTab = function(tab) {
    const photosContainer = document.getElementById('myPhotosContainer');
    const statusContainer = document.getElementById('myStatusContainer');
    const tabPhotos = document.getElementById('tabPhotos');
    const tabStatus = document.getElementById('tabStatus');

    if (tab === 'photos') {
        photosContainer.style.display = 'grid';
        statusContainer.style.display = 'none';
        tabPhotos.classList.add('active');
        tabStatus.classList.remove('active');
    } else {
        photosContainer.style.display = 'none';
        statusContainer.style.display = 'block';
        tabStatus.classList.add('active');
        tabPhotos.classList.remove('active');
    }
};

window.openViewPost = function(postId) {
    const post = globalPosts.find(p => p.id === postId);
    if (!post) return;
    
    const modal = document.getElementById('viewPostModal');
    const content = document.getElementById('viewPostContent');
    
    content.innerHTML = createPostHTML(post, post.id);
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
};

window.closeViewPost = function() {
    const modal = document.getElementById('viewPostModal');
    modal.style.display = 'none';
    modal.classList.add('hidden');
};
