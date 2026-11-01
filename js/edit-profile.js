import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const IMGBB_API_KEY = "432c4e1e55a011e0a4618ee53954a901";

const displayNameInput = document.getElementById('displayNameInput');
const usernameInput = document.getElementById('usernameInput');
const bioInput = document.getElementById('bioInput');
const bioCount = document.getElementById('bioCount');
const saveBtn = document.getElementById('saveBtn');
const editAvatar = document.getElementById('editAvatar');
const editAvatarImg = document.getElementById('editAvatarImg');
const dpUpload = document.getElementById('dpUpload');
const dpStatus = document.getElementById('dpStatus');

let currentUser = null;
let currentUserData = null;

bioInput.addEventListener('input', () => {
  bioCount.innerText = bioInput.value.length;
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      currentUserData = docSnap.data();
      displayNameInput.value = currentUserData.displayName || currentUserData.username || "";
      usernameInput.value = currentUserData.username || "";
      bioInput.value = currentUserData.bio || "";
      bioCount.innerText = bioInput.value.length;

      if (currentUserData.profilePicUrl) {
        editAvatar.style.display = 'none';
        editAvatarImg.src = currentUserData.profilePicUrl;
        editAvatarImg.style.display = 'block';
      } else if (displayNameInput.value) {
        editAvatar.innerText = displayNameInput.value.charAt(0).toUpperCase();
      }
    }
  } else {
    window.location.href = 'login.html';
  }
});

// Image Upload Logic with On-Screen Status
dpUpload.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Show local preview immediately
  const reader = new FileReader();
  reader.onload = (ev) => {
    editAvatar.style.display = 'none';
    editAvatarImg.src = ev.target.result;
    editAvatarImg.style.display = 'block';
  };
  reader.readAsDataURL(file);

  // Update Status Text
  dpStatus.innerText = "Uploading to ImgBB...";
  dpStatus.style.color = "#ffd700";
  
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: "POST",
      body: formData
    });
    const data = await response.json();
    
    if (data.success) {
      dpStatus.innerText = "Saving to Database...";
      const imageUrl = data.data.url;
      
      if(!currentUser) {
          dpStatus.innerText = "Error: User not loaded!";
          dpStatus.style.color = "#ff3b30";
          return;
      }

      await updateDoc(doc(db, "users", currentUser.uid), { profilePicUrl: imageUrl });
      currentUserData.profilePicUrl = imageUrl; 
      
      dpStatus.innerText = "Photo Updated Successfully! ✅";
      dpStatus.style.color = "#00ff00";
      
    } else {
      throw new Error(data.error ? data.error.message : "ImgBB upload failed");
    }
  } catch (error) {
    console.error(error);
    dpStatus.innerText = "Error: " + error.message;
    dpStatus.style.color = "#ff3b30";
  }
});

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

saveBtn.addEventListener('click', async () => {
  if (!currentUser || !currentUserData) return;

  let newDisplayName = toTitleCase(displayNameInput.value.trim());
  let newUsername = usernameInput.value.trim().toLowerCase();
  let newBio = bioInput.value.trim();

  if (!newDisplayName || !newUsername) {
    alert("Display Name and Username cannot be empty!");
    return;
  }

  saveBtn.innerText = "Saving...";

  try {
    const docRef = doc(db, "users", currentUser.uid);
    let updateData = { displayName: newDisplayName, bio: newBio };

    await updateDoc(docRef, updateData);
    alert("Profile Details updated successfully!");
    window.location.href = "app.html";

  } catch (error) {
    alert("Error: " + error.message);
    saveBtn.innerText = "Save";
  }
});
