import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, getDoc, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- Firebase Config (මෙතනට ඔයාගේ Keys දාන්න) ---
const firebaseConfig = {
  apiKey: "AIzaSyBokomsifyWOD6Fpd5XjpIeQjE102yK6W4",
  authDomain: "website-3b68a.firebaseapp.com",
  projectId: "website-3b68a",
  storageBucket: "website-3b68a.firebasestorage.app",
  messagingSenderId: "575880368447",
  appId: "1:575880368447:web:ea24a6935b31d1cc70438a",
  measurementId: "G-CETSDVTYS7"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==========================================
// 1. DATA: ලංකාවේ දිස්ත්‍රික්ක සහ නගර
// ==========================================
const slLocations = {
    "Ampara": ["Ampara Town", "Kalmunai", "Sainthamaruthu", "Akkaraipattu"],
    "Anuradhapura": ["Anuradhapura Town", "Kekirawa", "Medawachchiya", "Tambuttegama"],
    "Badulla": ["Badulla Town", "Bandarawela", "Haputale", "Ella"],
    "Batticaloa": ["Batticaloa Town", "Kattankudy", "Eravur"],
    "Colombo": ["Colombo 1-15", "Dehiwala", "Mount Lavinia", "Moratuwa", "Nugegoda", "Maharagama", "Kottawa", "Piliyandala", "Homagama", "Battaramulla", "Malabe", "Rajagiriya", "Kaduwela"],
    "Galle": ["Galle Town", "Hikkaduwa", "Ambalangoda", "Elpitiya", "Karapitiya", "Bentota"],
    "Gampaha": ["Gampaha Town", "Negombo", "Kelaniya", "Kiribathgoda", "Kadawatha", "Wattala", "Ja-Ela", "Minuwangoda", "Nittambuwa", "Ragama"],
    "Hambantota": ["Hambantota Town", "Tangalle", "Ambalantota", "Tissamaharama"],
    "Jaffna": ["Jaffna Town", "Chavakachcheri", "Nallur"],
    "Kalutara": ["Kalutara Town", "Panadura", "Horana", "Bandaragama", "Matugama", "Aluthgama", "Beruwala", "Wadduwa"],
    "Kandy": ["Kandy Town", "Peradeniya", "Katugastota", "Gampola", "Nawalapitiya", "Kundasale", "Digana"],
    "Kegalle": ["Kegalle Town", "Mawanella", "Warakapola", "Rambukkana"],
    "Kilinochchi": ["Kilinochchi Town", "Paranthan"],
    "Kurunegala": ["Kurunegala Town", "Kuliyapitiya", "Narammala", "Wariyapola", "Pannala", "Mawathagama"],
    "Mannar": ["Mannar Town", "Nanattan"],
    "Matale": ["Matale Town", "Dambulla", "Sigiriya"],
    "Matara": ["Matara Town", "Weligama", "Dikwella", "Akuressa"],
    "Monaragala": ["Monaragala Town", "Wellawaya", "Bibile"],
    "Mullaitivu": ["Mullaitivu Town", "Puthukkudiyiruppu"],
    "Nuwara Eliya": ["Nuwara Eliya Town", "Hatton", "Talawakele"],
    "Polonnaruwa": ["Polonnaruwa Town", "Kaduruwela", "Hingurakgoda"],
    "Puttalam": ["Puttalam Town", "Chilaw", "Wennappuwa", "Marawila"],
    "Ratnapura": ["Ratnapura Town", "Embilipitiya", "Balangoda"],
    "Trincomalee": ["Trincomalee Town", "Kinniya", "Kantale"],
    "Vavuniya": ["Vavuniya Town"]
};

// ==========================================
// 2. ICON HELPER
// ==========================================
function getServiceIcon(category) {
    const icons = {
        'Electrician': '⚡', 'Plumber': '🚿', 'Mason': '🧱', 'Carpenter': '🪚',
        'Painter': '🖌️', 'Welder': '🔥', 'Aluminum': '🪟', 'AC Repair': '❄️',
        'Fridge Repair': '🧊', 'CCTV': '📹', 'Computer Repair': '💻', 'Driver': '🚗',
        'Cleaner': '🧹', 'Garden': '🌱', 'Cook': '🍳', 'Baby Sitter': '🍼',
        'Movers': '📦', 'Tutor': '📚', 'Beauty': '💇‍♀️', 'Other': '🛠️'
    };
    return icons[category] || '🛠️';
}

// ==========================================
// 3. DROPDOWN LOGIC
// ==========================================
const distSelect = document.getElementById('districtSelect');
const citySelect = document.getElementById('citySelect');

if (distSelect && citySelect) {
    const districts = Object.keys(slLocations).sort();
    districts.forEach(dist => {
        const option = document.createElement("option");
        option.value = dist;
        option.textContent = dist;
        distSelect.appendChild(option);
    });

    distSelect.addEventListener('change', function() {
        const selectedDist = this.value;
        citySelect.innerHTML = '<option value="">නගරය තෝරන්න...</option>';
        if (selectedDist && slLocations[selectedDist]) {
            citySelect.disabled = false;
            const cities = slLocations[selectedDist].sort();
            cities.forEach(city => {
                const option = document.createElement("option");
                option.value = city;
                option.textContent = city;
                citySelect.appendChild(option);
            });
        } else {
            citySelect.disabled = true;
        }
    });
}

// ==========================================
// 4. REGISTER LOGIC (With SweetAlert2)
// ==========================================
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = registerForm.querySelector('button');
        
        if(!distSelect.value || !citySelect.value) {
            // Error Popup
            Swal.fire({
                icon: 'warning',
                title: 'අසම්පූර්ණයි!',
                text: 'කරුණාකර දිස්ත්‍රික්කය සහ නගරය තෝරන්න.',
                confirmButtonColor: '#f39c12'
            });
            return;
        }

        btn.textContent = "ලියාපදිංචි වෙමින්...";
        btn.disabled = true;

        try {
            await addDoc(collection(db, "providers"), {
                name: document.getElementById('name').value,
                category: document.getElementById('category').value,
                phone: document.getElementById('phone').value,
                district: distSelect.value,
                city: citySelect.value,
                fullLocation: `${citySelect.value}, ${distSelect.value}`,
                description: document.getElementById('desc').value,
                timestamp: new Date(),
                status: "pending"
            });

            // Success Popup
            Swal.fire({
                icon: 'success',
                title: 'සාර්ථකයි!',
                text: 'ඔබේ දත්ත Admin වෙත යොමු කෙරුණා. පරීක්ෂා කිරීමෙන් පසු වෙබ් අඩවියේ පෙන්වනු ඇත.',
                confirmButtonColor: '#00b894',
                confirmButtonText: 'හරි'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = "index.html";
                }
            });

        } catch (error) {
            console.error("Error:", error);
            Swal.fire({
                icon: 'error',
                title: 'දෝෂයක්!',
                text: error.message,
                confirmButtonColor: '#d63031'
            });
            btn.disabled = false;
            btn.textContent = "දත්ත ඇතුළත් කරන්න";
        }
    });
}

// ==========================================
// 5. HOME PAGE LOGIC
// ==========================================
const servicesList = document.getElementById('servicesList');
const homeLocFilter = document.getElementById('locationFilter');

if (homeLocFilter) {
    homeLocFilter.innerHTML = '<option value="">සියලු ප්‍රදේශ</option>';
    Object.keys(slLocations).sort().forEach(dist => {
        const option = document.createElement("option");
        option.value = dist;
        option.textContent = dist;
        homeLocFilter.appendChild(option);
    });
}

if (servicesList) {
    async function loadServices() {
        servicesList.innerHTML = `<div class="loader">Loading...</div>`;
        try {
            const q = query(
                collection(db, "providers"), 
                where("status", "==", "approved"), 
                orderBy("timestamp", "desc")
            );
            
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                servicesList.innerHTML = "<p style='text-align:center;'>සේවා සපයන්නන් නැත.</p>";
                return;
            }
            servicesList.innerHTML = ""; 

            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const providerId = docSnap.id;
                const icon = getServiceIcon(data.category);
                const locationShow = data.fullLocation || data.city || "ශ්‍රී ලංකාව";

                const card = `
                    <div class="card">
                        <div class="card-header">
                            <div class="avatar">${icon}</div>
                            <div>
                                <h3>${data.name}</h3>
                                <span class="category-tag">${data.category}</span>
                            </div>
                        </div>
                        <div class="card-body">
                            <span class="location"><i class="fas fa-map-marker-alt"></i> ${locationShow}</span>
                            <p>${data.description}</p>
                        </div>
                        
                        <div class="card-actions">
                            <a href="tel:${data.phone}" class="phone-btn action-btn">
                                <i class="fas fa-phone-alt"></i> Call
                            </a>
                            <button onclick="window.openReviewModal('${providerId}', '${data.name}')" class="review-btn action-btn">
                                <i class="fas fa-star"></i> Reviews
                            </button>
                        </div>
                    </div>
                `;
                servicesList.innerHTML += card;
            });
        } catch (error) {
            console.error(error);
            if (error.message.includes("indexes")) {
                console.log("Create an Index in Firebase Console.");
            }
            servicesList.innerHTML = "<p>දත්ත ගැනීමේ දෝෂයක්.</p>";
        }
    }
    loadServices();
}

// ==========================================
// 6. REVIEW MODAL LOGIC (With SweetAlert2)
// ==========================================
window.openReviewModal = async function(id, name) {
    const modal = document.getElementById('reviewModal');
    const title = document.getElementById('modalTitle');
    const hiddenId = document.getElementById('currentProviderId');
    const list = document.getElementById('reviewsList');

    modal.style.display = "flex";
    title.innerText = name + " - Reviews";
    hiddenId.value = id;
    
    list.innerHTML = "Loading...";
    
    try {
        const reviewsRef = collection(db, "providers", id, "reviews");
        const q = query(reviewsRef, where("status", "==", "approved"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);

        list.innerHTML = "";
        if(snapshot.empty) {
            list.innerHTML = "<p class='no-reviews'>තවම Reviews නැත.</p>";
        }

        snapshot.forEach(doc => {
            const r = doc.data();
            let stars = "⭐".repeat(r.rating);
            
            list.innerHTML += `
                <div class="review-item">
                    <div class="review-header">
                        <strong>${r.userName}</strong>
                        <span class="star-rating">${stars}</span>
                    </div>
                    <p>${r.comment}</p>
                </div>
            `;
        });
    } catch (err) {
        console.error(err);
        list.innerHTML = "Error loading reviews.";
    }
}

window.closeModal = function() {
    document.getElementById('reviewModal').style.display = "none";
}

window.onclick = function(event) {
    const modal = document.getElementById('reviewModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Review Save Logic (With SweetAlert2)
const reviewForm = document.getElementById('addReviewForm');
if(reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const providerId = document.getElementById('currentProviderId').value;
        const name = document.getElementById('reviewerName').value;
        const phone = document.getElementById('reviewerPhone').value;
        const rating = document.getElementById('reviewStars').value;
        const comment = document.getElementById('reviewComment').value;
        const btn = reviewForm.querySelector('button');

        if(!providerId) return;

        try {
            btn.textContent = "Saving...";
            btn.disabled = true;

            const reviewsRef = collection(db, "providers", providerId, "reviews");
            await addDoc(reviewsRef, {
                userName: name,
                userPhone: phone,
                rating: parseInt(rating),
                comment: comment,
                timestamp: new Date(),
                status: "pending"
            });

            // Success Popup
            Swal.fire({
                icon: 'success',
                title: 'ස්තුතියි!',
                text: 'ඔබේ Review එක Admin අනුමැතිය සඳහා යොමු කෙරුණා.',
                confirmButtonColor: '#00b894',
                confirmButtonText: 'හරි'
            }).then(() => {
                document.getElementById('reviewerName').value = "";
                document.getElementById('reviewerPhone').value = "";
                document.getElementById('reviewComment').value = "";
                document.getElementById('reviewStars').value = "5";
                window.closeModal();
            });

        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'දෝෂයක්!',
                text: err.message,
                confirmButtonColor: '#d63031'
            });
        } finally {
            btn.textContent = "Review එක දාන්න";
            btn.disabled = false;
        }
    });
}

// ==========================================
// 7. SEARCH FUNCTION
// ==========================================
window.filterServices = function() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const loc = document.getElementById('locationFilter') ? document.getElementById('locationFilter').value.toLowerCase() : "";
    const cards = document.getElementsByClassName('card');

    for (let i = 0; i < cards.length; i++) {
        const title = cards[i].getElementsByTagName("h3")[0].innerText.toLowerCase();
        const cat = cards[i].querySelector(".category-tag").innerText.toLowerCase();
        const locInfo = cards[i].querySelector(".location").innerText.toLowerCase();
        
        const textMatch = (title.includes(input) || cat.includes(input));
        const locMatch = (loc === "" || locInfo.includes(loc));

        cards[i].style.display = (textMatch && locMatch) ? "" : "none";
    }
}