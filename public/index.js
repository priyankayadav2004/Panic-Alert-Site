let contacts = [];
let diary = [];
let songs = [];

// Load saved data + set up listeners
window.onload = function () {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }

  const savedContacts = localStorage.getItem("contacts");
  if (savedContacts) contacts = JSON.parse(savedContacts);

  const savedDiary = localStorage.getItem("diary");
  if (savedDiary) diary = JSON.parse(savedDiary);

  const savedSongs = localStorage.getItem("songs");
  if (savedSongs) songs = JSON.parse(savedSongs);

  updateContactList();
  updateDiaryList();
  updateMusicList();

  document.getElementById("toggleThemeButton").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark") ? "dark" : "light"
    );
  });

  document
    .getElementById("panicButton")
    .addEventListener("click", sendPanicAlerts);
};

// Section toggle
function showAlert(feature) {
  document.getElementById("contacts-section").style.display = "none";
  document.getElementById("diary-section").style.display = "none";
  document.getElementById("music-section").style.display = "none";

  if (feature === "Contacts") {
    document.getElementById("contacts-section").style.display = "block";
  } else if (feature === "Diary") {
    document.getElementById("diary-section").style.display = "block";
  } else if (feature === "Music Library") {
    document.getElementById("music-section").style.display = "block";
  }
}

// Add contact
function addContact() {
  const name = document.getElementById("contactName").value.trim();
  const number = document.getElementById("contactNumber").value.trim();
  const email = document.getElementById("contactEmail").value.trim();

  if (name && number && email) {
    contacts.push({ name, number, email });
    localStorage.setItem("contacts", JSON.stringify(contacts));
    updateContactList();
    document.getElementById("contactName").value = "";
    document.getElementById("contactNumber").value = "";
    document.getElementById("contactEmail").value = "";
  } else {
    alert("Please enter name, phone number, and email.");
  }
}

function updateContactList() {
  const list = document.getElementById("contactList");
  list.innerHTML = "";

  contacts.forEach((c, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${c.name} | 📞 ${c.number} | 📧 ${c.email}
      <button onclick="removeContact(${index})" style="margin-left:10px; background-color:#ff6666; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">❌ Remove</button>
    `;
    list.appendChild(li);
  });
}

function sendPanicAlerts() {
  if (contacts.length === 0) {
    alert("⚠️ No contacts to alert. Please add contacts first.");
    return;
  }

  contacts.forEach((contact) => {
    fetch("http://localhost:3000/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: contact.email,
        name: contact.name,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to send email");
        console.log(`✅ Email sent to ${contact.email}`);
      })
      .catch((err) => {
        console.error(`❌ Error sending to ${contact.email}:`, err);
      });
  });
  
  alert("🚨 Panic emails sent to all contacts!");
  
}
function removeSong(index) {
  if (confirm(`Are you sure you want to remove "${songs[index].title}"?`)) {
    songs.splice(index, 1);
    localStorage.setItem("songs", JSON.stringify(songs));
    updateMusicList();
  }
}

// Diary
function addDiaryEntry() {
  const entry = document.getElementById("diaryEntry").value.trim();
  if (entry) {
    const date = new Date().toLocaleString();
    diary.push({ entry, date });
    localStorage.setItem("diary", JSON.stringify(diary));
    updateDiaryList();
    document.getElementById("diaryEntry").value = "";
  } else {
    alert("Please write something first.");
  }
}

function updateDiaryList() {
  const list = document.getElementById("diaryList");
  list.innerHTML = "";
  diary.forEach((d) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${d.date}</strong><br>${d.entry}`;
    list.appendChild(li);
  });
}

// Music
function addSong() {
  const title = document.getElementById("songTitle").value.trim();
  const link = document.getElementById("songLink").value.trim();

  if (title && link.startsWith("http")) {
    songs.push({ title, link });
    localStorage.setItem("songs", JSON.stringify(songs));
    updateMusicList();
    document.getElementById("songTitle").value = "";
    document.getElementById("songLink").value = "";
  } else {
    alert("Enter a valid song title and YouTube link.");
  }
}

function updateMusicList() {
  const list = document.getElementById("musicList");
  list.innerHTML = "";

  songs.forEach((s, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <a href="${s.link}" target="_blank">${s.title}</a>
      <button onclick="removeSong(${index})" style="margin-left:10px; background-color:#ff6666; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">❌ Remove</button>
    `;
    list.appendChild(li);
  });
}
function removeSong(index) {
  if (confirm(`Are you sure you want to remove "${songs[index].title}"?`)) {
    songs.splice(index, 1);
    localStorage.setItem("songs", JSON.stringify(songs));
    updateMusicList();
  }
}
async function exportDiaryAsPDF() {
  if (diary.length === 0) {
    alert("No diary entries to export.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;

  doc.setFontSize(16);
  doc.text("📓 Your Diary Entries", 10, y);
  y += 10;

  doc.setFontSize(12);

  diary.forEach((entry, index) => {
    const text = `🕒 ${entry.date}\n${entry.entry}\n`;
    const lines = doc.splitTextToSize(text, 180); // wrap text
    if (y + lines.length * 10 > 270) {
      doc.addPage();
      y = 10;
    }
    doc.text(lines, 10, y);
    y += lines.length * 10;
  });

  doc.save("My_Diary.pdf");
}
function handleChat() {
  const input = document.getElementById("chatInput").value.trim();
  const chatlog = document.getElementById("chatlog");

  if (!input) return;

  // Add user message
  chatlog.innerHTML += `<div><strong>You:</strong> ${input}</div>`;

  // Basic bot response
  let response = "I'm here for you. Just breathe.";

  if (input.toLowerCase().includes("sad")) {
    response =
      "It's okay to feel sad. Try writing in your diary or listening to music.";
  } else if (
    input.toLowerCase().includes("panic") ||
    input.toLowerCase().includes("scared")
  ) {
    response = "You're not alone. Press the panic button if you need help.";
  } else if (input.toLowerCase().includes("happy")) {
    response = "That’s great! Keep holding onto this feeling.";
  } else if (input.toLowerCase().includes("alone")) {
    response = "You're not alone. You’ve got people who care for you.";
  }

  // Add bot reply
  setTimeout(() => {
    chatlog.innerHTML += `<div><strong>Bot:</strong> ${response}</div>`;
    chatlog.scrollTop = chatlog.scrollHeight;
  }, 600);

  document.getElementById("chatInput").value = "";
}

