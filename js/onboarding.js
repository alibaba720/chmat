import { auth, db, authReady } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const IMGBB_API_KEY = "432c4e1e55e011e0a4618ee53954a901"; 

let currentUser = null;
let currentUserData = null;

authReady.then(() => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            const docSnap = await getDoc(doc(db, "users", user.uid));
            if (docSnap.exists()) {
                currentUserData = docSnap.data();
                if (currentUserData.displayName) document.getElementById('displayNameInput').value = currentUserData.displayName;
                if (currentUserData.bio) document.getElementById('bioInput').value = currentUserData.bio;
            }
        } else {
            window.location.href = 'login.html';
        }
    });
});

document.getElementById('dpInput')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const preview = document.getElementById('dpPreviewImg');
            preview.innerHTML = `<img src="${event.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
            preview.dataset.base64 = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

window.saveDPAndNext = async function() {
    const preview = document.getElementById('dpPreviewImg');
    const base64Image = preview.dataset.base64;

    if (!base64Image) {
        goToStep2();
        return;
    }

    const btn = document.getElementById('dpNextBtn');
    const loading = document.getElementById('dpLoading');
    btn.disabled = true;
    btn.innerText = "Saving...";
    loading.style.display = "block";

    try {
        const formData = new FormData();
        formData.append("image", base64Image.split(',')[1]);

        const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();

        if (data.success) {
            const imageUrl = data.data.url;
            await updateDoc(doc(db, "users", currentUser.uid), { profilePicUrl: imageUrl });
            currentUserData.profilePicUrl = imageUrl;
            goToStep2();
        } else {
            alert("Image upload failed. Try again or skip.");
        }
    } catch (e) {
        console.error(e);
        alert("Error: " + e.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "Next";
        loading.style.display = "none";
    }
};

window.goToStep2 = function() {
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');
};

window.saveProfileInfo = async function() {
    const name = document.getElementById('displayNameInput').value.trim();
    const bio = document.getElementById('bioInput').value.trim();

    if (!name) {
        alert("Please enter a display name!");
        return;
    }

    try {
        await updateDoc(doc(db, "users", currentUser.uid), { 
            displayName: name,
            bio: bio || "Hello, I am using CHMAT!"
        });
        finishOnboarding();
    } catch (e) {
        alert("Error saving details: " + e.message);
    }
};

window.finishOnboarding = function() {
    window.location.href = 'app.html';
};
