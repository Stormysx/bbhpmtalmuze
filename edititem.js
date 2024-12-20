import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCOK5HGmmS1wmobyNDGQiVFWq4DRvXP04A",
    authDomain: "bbhpmtalmuze.firebaseapp.com",
    databaseURL: "https://bbhpmtalmuze-default-rtdb.firebaseio.com",
    projectId: "bbhpmtalmuze",
    storageBucket: "bbhpmtalmuze.appspot.com",
    messagingSenderId: "703489041966",
    appId: "1:703489041966:web:657fdf3ea5b0e7421da1bf",
    measurementId: "G-WVD94QPTNP"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const fishListDiv = document.getElementById("fish-list");
const editForm = document.getElementById("edit-form-container");

function getURLParameter(name) {
    return new URLSearchParams(window.location.search).get(name);
}

function loadFishData(section = "A-1") {
    const fishRef = ref(db, `selections/${section}`);
    onValue(fishRef, (snapshot) => {
        fishListDiv.innerHTML = ""; 
        const data = snapshot.val();
        if (data) {
            Object.keys(data).forEach((key) => {
                const fishData = data[key];
                fishListDiv.innerHTML += `
                    <div class="fish-item">
                        <h3>${fishData.name}</h3>
                        <p><strong>Açıklama (EN):</strong> ${fishData.description_en}</p>
                        <p><strong>Açıklama (TR):</strong> ${fishData.description_tr}</p>
                        <button class="edit-button" data-key="${key}" data-section="${section}">Düzenle</button>
                        <button class="delete-button" data-key="${key}" data-section="${section}">Sil</button>
                    </div>
                `;

                if (fishData.subselections) {
                    const subselectionData = fishData.subselections;
                    Object.keys(subselectionData).forEach((subKey) => {
                        const subFishData = subselectionData[subKey];
                        fishListDiv.innerHTML += `
                            <div class="fish-item" style="margin-left: 20px;">
                                <h3>${subFishData.name}</h3>
                                <p><strong>Açıklama (EN):</strong> ${subFishData.description_en}</p>
                                <p><strong>Açıklama (TR):</strong> ${subFishData.description_tr}</p>
                                <button class="edit-button" data-key="${subKey}" data-section="${section}">Düzenle</button>
                                <button class="delete-button" data-key="${subKey}" data-section="${section}">Sil</button>
                            </div>
                        `;
                    });
                }
            });
        } else {
            fishListDiv.innerHTML = "<h2>Hiç veri bulunamadı.</h2>";
        }
    });
}

function editFish(section, key) {
    const fishRef = ref(db, `selections/${section}/${key}`);
    onValue(fishRef, (snapshot) => {
        const fishData = snapshot.val();
        document.getElementById("edit-name").value = fishData.name;
        document.getElementById("edit-description-en").value = fishData.description_en;
        document.getElementById("edit-description-tr").value = fishData.description_tr;
        editForm.style.display = "block";

        window.saveEdit = function() {
            const updatedName = document.getElementById("edit-name").value;
            const updatedDescriptionEn = document.getElementById("edit-description-en").value;
            const updatedDescriptionTr = document.getElementById("edit-description-tr").value;

            if (updatedName && updatedDescriptionEn && updatedDescriptionTr) {
                update(fishRef, {
                    name: updatedName,
                    description_en: updatedDescriptionEn,
                    description_tr: updatedDescriptionTr
                }).then(() => {
                    alert("Ürün bilgileri güncellendi!");
                    editForm.style.display = "none";
                    loadFishData(section);
                }).catch((error) => {
                    console.error("Güncelleme hatası:", error);
                });
            }
        };

        window.cancelEdit = function() {
            editForm.style.display = "none";
        };
    });
}

function confirmDelete(section, key) {
    if (confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
        const fishRef = ref(db, `selections/${section}/${key}`);
        remove(fishRef).then(() => {
            alert("Balık silindi!");
            loadFishData(section);
        }).catch((error) => {
            console.error("Silme hatası:", error);
        });
    }
}

fishListDiv.addEventListener("click", (event) => {
    const key = event.target.dataset.key;
    const section = event.target.dataset.section;
    if (event.target.classList.contains("edit-button")) {
        editFish(section, key);
    } else if (event.target.classList.contains("delete-button")) {
        confirmDelete(section, key);
    }
});

window.onload = () => {
    const sectionFromURL = getURLParameter("section"); 
    const defaultSection = sectionFromURL || "A-1"; 
    loadFishData(defaultSection);
};
