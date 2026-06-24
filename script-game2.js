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
let selectedLetters = [];

let timeLeft = 15;
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
timeLeft = 15;
timerBar.style.width = "100%";

timerInterval = setInterval(() => {
timeLeft--;
timerBar.style.width = `${(timeLeft / 15) * 100}%`;

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
selectedLetters = [];

if (questionCounter) {
questionCounter.textContent = `ข้อ ${currentQuestion + 1} / ${wordList.length}`;
}

answerSlots.innerHTML = "";
letterBank.innerHTML = "";

const letters = getLetters(currentWord);

letters.forEach(() => {
const slot = document.createElement("div");
slot.className = "slot";
answerSlots.appendChild(slot);
});

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

displayLetters.forEach(letter => {
const btn = document.createElement("button");
btn.className = "letter-btn";
btn.textContent = letter;

btn.onclick = () => {
if (selectedLetters.length >= letters.length) {
return;
}

selectedLetters.push(letter);

const slots = document.querySelectorAll(".slot");
slots[selectedLetters.length - 1].textContent = letter;

btn.remove();
};

letterBank.appendChild(btn);
});

startTimer();
}

submitBtn.addEventListener("click", () => {
const answer = selectedLetters.join("");

if (answer === currentWord) {
score++;
}

currentQuestion++;
loadQuestion();
});

// 🛠️ ปุ่มลำโพงใหญ่ตรงกลางบอร์ดเกมเดิม: ปรับให้รองรับระบบสลับ เปิด-ปิด เช่นกัน
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
// 🔊 [เพิ่มใหม่] สคริปต์ผูกมัดหน้ากติกา และระบบสลับ เปิด-ปิด เสียงพูดขวาบนสุด
// ==========================================================

// 🎯 ตั้งค่าดักจับปุ่มเริ่มเล่นด่าน 2 สลับกติกาเข้าสู่ตัวเกมหลัก
if (btnStartPlay) {
btnStartPlay.onclick = () => {
window.speechSynthesis.cancel(); // ตัดเสียงบรรยายกติกาออกทันทีเมื่อเข้าเกม
if (introSection) introSection.classList.add("hidden");
if (gameMainContent) gameMainContent.classList.remove("hidden");
loadQuestion(); // บูตเริ่มเล่นโจทย์ข้อที่ 1 ทันที
};
}

// ฟังก์ชันเปิด-ปิดเสียง สำหรับปุ่มมุมขวาบนหน้ากติกา (Intro)
function toggleIntroSpeech() {
if (window.speechSynthesis.speaking) {
window.speechSynthesis.cancel(); // ถ้ากำลังพูดอยู่ -> กดอีกรอบให้หยุด
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
window.speechSynthesis.speak(utterance); // เล่นเสียงบรรยายกติกา
}
}

// ฟังก์ชันเปิด-ปิดเสียง สำหรับปุ่มมุมขวาบนหน้าเล่นเกมจริง (Gameplay)
function toggleGameplaySpeech() {
if (window.speechSynthesis.speaking) {
window.speechSynthesis.cancel(); // ถ้ากำลังพูดอยู่ -> กดอีกรอบให้หยุด
} else {
if (currentWord) {
const utterance = new SpeechSynthesisUtterance(`จงต่อคำศัพท์คำว่า... ${currentWord}`);
utterance.lang = "th-TH";
window.speechSynthesis.speak(utterance); // เล่นเสียงโจทย์ประจำข้อ
}
}
} 