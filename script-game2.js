/* ===== script-game2.js — Word Builder (No Age Badge Version) ===== */

// 1. 🔄 ดึงข้อมูลอายุจากระบบกลาง (Default เป็นอายุ 8 หากไม่พบข้อมูล)
const age = parseInt(localStorage.getItem("userAge")) || 8;

const wordBank = {
child: ["แมว", "บ้าน", "ปลา", "นก", "รถ", "ข้าว", "ช้าง", "เสือ", "เด็ก", "ปู"],
teen: ["กิจกรรม", "เทคโนโลยี", "มหาวิทยาลัย", "ธรรมชาติ", "ประสบการณ์", "วรรณคดี", "สามัคคี", "สื่อสาร", "พลังงาน", "ภาพยนตร์"],
adult: ["ยุทธศาสตร์", "ผู้ประกอบการ", "ประชาธิปไตย", "นวัตกรรม", "เสถียรภาพ", "ภูมิปัญญา", "สถาปัตยกรรม", "วิเคราะห์", "ศักยภาพ", "สัมพันธภาพ"]
};

let fullWordList = [];
let wordList = [];

if (age <= 9) {
fullWordList = wordBank.child;
} else if (age <= 18) {
fullWordList = wordBank.teen;
} else {
fullWordList = wordBank.adult;
}

function shuffle(array) {
return [...array].sort(() => Math.random() - 0.5);
}

wordList = shuffle(fullWordList).slice(0, 5);

let currentQuestion = 0;
let score = 0;
let currentWord = "";
let selectedLetters = []; // จะเก็บเป็น Object แทน: { id: uniqueId, text: letter }

let timeLeft = 20; // ⏱️ ตั้งค่าเวลาเป็น 20 วินาทีตามที่ต้องการ
let timerInterval;

// ดึง DOM Elements
const gamePlaySection = document.getElementById("gamePlaySection");
const summarySection = document.getElementById("summarySection");
const timerContainer = document.getElementById("timerContainer");
const timerBar = document.getElementById("timerBar");

const answerSlots = document.getElementById("answerSlots");
const letterBank = document.getElementById("letterBank");
const submitBtn = document.getElementById("submitBtn");
const speakBtn = document.getElementById("speakBtn");
const questionCounter = document.getElementById("questionCounter");
const nextGameBtn = document.getElementById("nextGameBtn");

const correctNum = document.getElementById("correct-num");
const wrongNum = document.getElementById("wrong-num");

// 🛠️ DOM แยกส่วนควบคุมหน้าเปิดกติกา (ตามโมเดลเกมแรก)
const introSection = document.getElementById("introSection");
const gameMainContent = document.getElementById("gameMainContent");
const btnStartPlay = document.getElementById("btn-start-play");

function getLetters(word) {
return Array.from(word);
}

function startTimer() {
clearInterval(timerInterval);
timeLeft = 20; // ⏱️ รีเซ็ตเวลาเริ่มต้นที่ 20 วินาทีทุกข้อ
if (timerBar) timerBar.style.width = "100%";

timerInterval = setInterval(() => {
timeLeft--;
if (timerBar) timerBar.style.width = `${(timeLeft / 20) * 100}%`;

if (timeLeft <= 0) {
clearInterval(timerInterval);
handleTimeOut();
}
}, 1000);
}

function handleTimeOut() {
currentQuestion++;
loadQuestion();
}

function renderSlots() {
answerSlots.innerHTML = "";
const letters = getLetters(currentWord);

// วาดช่องคำตอบ (Slots) ตามความยาวของคำศัพท์จริง
for (let i = 0; i < letters.length; i++) {
const slot = document.createElement("div");
slot.className = "slot";
// สไตล์เพิ่มเติม: ทำปุ่มให้ผู้เล่นกดที่ตัวอักษรใน Slot เพื่อส่งคืนได้
if (selectedLetters[i]) {
slot.textContent = selectedLetters[i].text;
slot.style.cursor = "pointer";
slot.title = "กดเพื่อดึงตัวอักษรนี้ออก";


// 🎯 ลอจิกสำคัญ: เมื่อกดที่ตัวอักษรในช่องคำตอบ -> คืนค่ากลับไปด้านล่าง
slot.onclick = () => {
const removedLetterObj = selectedLetters[i];
// ดึงออกจากอาร์เรย์คำตอบ
selectedLetters.splice(i, 1);


// นำปุ่มกลับไปแสดงในคลังตัวอักษรด้านล่าง (Letter Bank)
const originalBtn = document.getElementById(removedLetterObj.id);
if (originalBtn) {
originalBtn.style.display = "inline-block"; // สั่งให้กลับมาแสดงผลตัวที่เคยกดไปแยกเป็นตัวๆ
}
// วาดการแสดงผลของช่องคำตอบใหม่ทั้งหมดเพื่อให้ตัวอักษรเลื่อนเรียงกันชิดซ้าย
renderSlots();
};
} else {
slot.textContent = "";
}
answerSlots.appendChild(slot);
}
}

function loadQuestion() {
if (currentQuestion >= wordList.length) {
clearInterval(timerInterval);
if (timerContainer) timerContainer.classList.add("hidden");
if (gamePlaySection) gamePlaySection.classList.add("hidden");
localStorage.setItem("soundMatchScore", score);
if (correctNum) correctNum.textContent = score;
if (wrongNum) wrongNum.textContent = wordList.length - score;

if (summarySection) summarySection.classList.remove("hidden");
return;
}

currentWord = wordList[currentQuestion];
selectedLetters = []; // ล้างคำตอบเก่า

if (questionCounter) {
questionCounter.textContent = `ข้อ ${currentQuestion + 1} / ${wordList.length}`;
}

letterBank.innerHTML = "";
const letters = getLetters(currentWord);

// วาดช่อง Slot เริ่มต้นว่างๆ
renderSlots();

let displayLetters = [...letters];

if (age > 9) {
const fakeLetters = ["ก", "น", "ม", "ร", "ส", "์", "ะ", "า"];
const extra = age <= 18 ? 1 : 2;

for (let i = 0; i < extra; i++) {
displayLetters.push(
fakeLetters[Math.floor(Math.random() * fakeLetters.length)]
);
}
}

displayLetters = shuffle(displayLetters);

// สร้างคลังปุ่มตัวอักษร
displayLetters.forEach((letter, index) => {
const btn = document.createElement("button");
btn.className = "letter-btn";
btn.textContent = letter;
// กำหนด Unique ID ให้แต่ละปุ่มเพื่อใช้อ้างอิงตอนกดเรียกคืน
const uniqueId = `letter-${currentQuestion}-${index}`;
btn.id = uniqueId;

btn.onclick = () => {
if (selectedLetters.length >= letters.length) {
return;
}

// เก็บข้อมูลทั้งตัวหนังสือและไอดีของปุ่มไว้
selectedLetters.push({ id: uniqueId, text: letter });

// อัปเดต UI หน้าต่างช่องตอบคำถาม
renderSlots();

// ซ่อนเฉพาะปุ่มที่ถูกกดเลือกตัวนี้ตัวเดียวเท่านั้น
btn.style.display = "none";
};

letterBank.appendChild(btn);
});

startTimer();
}

submitBtn.addEventListener("click", () => {
// แปลงค่ากลับมาเป็นข้อความเดี่ยวเพื่อเช็กคำตอบ
const answer = selectedLetters.map(item => item.text).join("");

if (answer === currentWord) {
score++;
}

currentQuestion++;
loadQuestion();
});

// 🛠️ ปุ่มลำโพงใหญ่ตรงกลางบอร์ดเกมเดิม
speakBtn.addEventListener("click", () => {
if (window.speechSynthesis.speaking) {
window.speechSynthesis.cancel();
} else {
const utterance = new SpeechSynthesisUtterance(currentWord);
utterance.lang = "th-TH";
window.speechSynthesis.speak(utterance);
}
});

nextGameBtn.addEventListener("click", () => {
window.location.href = "speed-reading.html";
});


// ==========================================================
// 🔊 สคริปต์ผูกมัดหน้ากติกา และระบบสลับ เปิด-ปิด เสียงพูดขวาบนสุด
// ==========================================================

if (btnStartPlay) {
btnStartPlay.onclick = () => {
window.speechSynthesis.cancel();
if (introSection) introSection.classList.add("hidden");
if (gameMainContent) gameMainContent.classList.remove("hidden");
loadQuestion();
};
}

function toggleIntroSpeech() {
if (window.speechSynthesis.speaking) {
window.speechSynthesis.cancel();
} else {
let texts = ["เกมที่ 2 บล็อกต่อคำศัพท์. มาฝึกทักษะการฟังและการสะกดคำศัพท์ผ่านบล็อกตัวอักษรกันครับ!"];
const card = document.getElementById("intro-text-card");
if (card) {
const paragraphs = card.querySelectorAll("p");
paragraphs.forEach(p => {
texts.push(p.innerText.replace("👉", "").trim());
});
}
const utterance = new SpeechSynthesisUtterance(texts.join(". "));
utterance.lang = "th-TH";
window.speechSynthesis.speak(utterance);
}
}

function toggleGameplaySpeech() {
if (window.speechSynthesis.speaking) {
window.speechSynthesis.cancel();
} else {
if (currentWord) {
const utterance = new SpeechSynthesisUtterance(`จงต่อคำศัพท์คำว่า... ${currentWord}`);
utterance.lang = "th-TH";
window.speechSynthesis.speak(utterance);
}
}
}