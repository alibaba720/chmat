import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const IMGBB_API_KEY = "432c4e1e55a011e0a4618ee53954a901"; 

const postText = document.getElementById('postText');
const postFeeling = document.getElementById('postFeeling');
const postPrivacy = document.getElementById('postPrivacy');
const postImage = document.getElementById('postImage');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const imagePreview = document.getElementById('imagePreview');
const removeImageBtn = document.getElementById('removeImageBtn');
const submitPostBtn = document.getElementById('submitPostBtn');

let currentUser = null;
let currentUserData = null;
let selectedImageFile = null;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    const docSnap = await getDoc(doc(db, "users", user.uid));
    if (docSnap.exists()) currentUserData = docSnap.data();
  } else {
    window.location.href = 'login.html';
  }
});

postImage.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.src = e.target.result;
      imagePreviewContainer.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }
});

removeImageBtn.addEventListener('click', () => {
  postImage.value = '';
  selectedImageFile = null;
  imagePreviewContainer.classList.add('hidden');
});

submitPostBtn.addEventListener('click', async () => {
  if (!currentUser || !currentUserData) return;

  const text = postText.value.trim();
  const feeling = postFeeling.value;
  const privacy = postPrivacy.value;

  if (!text && !selectedImageFile && !feeling) {
    alert("Please write something or add an image!");
    return;
  }

  submitPostBtn.innerText = "Posting...";
  submitPostBtn.disabled = true;

  try {
    let imageUrl = "";

    if (selectedImageFile) {
      const formData = new FormData();
      formData.append("image", selectedImageFile);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      
      if (data.success) {
        imageUrl = data.data.url;
      } else {
        throw new Error("Image upload failed.");
      }
    }

    await addDoc(collection(db, "posts"), {
      uid: currentUser.uid,
      username: currentUserData.username,
      displayName: currentUserData.displayName || currentUserData.username,
      profilePicUrl: currentUserData.profilePicUrl || "", // DP saved with post
      text: text,
      feeling: feeling,
      imageUrl: imageUrl,
      privacy: privacy,
      createdAt: serverTimestamp(),
      likes: [], 
      comments: [] 
    });

    alert("Post shared successfully!");
    window.location.href = "app.html";

  } catch (error) {
    console.error("Error creating post:", error);
    alert("Error: " + error.message);
    submitPostBtn.innerText = "Post";
    submitPostBtn.disabled = false;
  }
});
