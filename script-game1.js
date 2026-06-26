// ===== script-game1.js — Letter Detective (3-Age Groups Edition) =====

// 1. 🔄 ดึงข้อมูลอายุจาก localStorage ทั่วทั้งเว็บ (Default เป็นอายุ 7 หากไม่พบข้อมูล)
const userAge = parseInt(localStorage.getItem("userAge")) || 7;

// 2. ออกแบบคลังโจทย์แยกตามระดับความเหมาะสมของอายุ
const easyQuestions = [
    { pool: ["b", "b", "d", "b", "b"], answer: "d" },
    { pool: ["m", "n", "m", "m", "m"], answer: "n" },
    { pool: ["p", "p", "p", "q", "p"], answer: "q" },
    { pool: ["ด", "ด", "ต", "ด", "ด"], answer: "ต" },
    { pool: ["ถ", "ภ", "ภ", "ภ", "ภ"], answer: "ถ" }
];

const hardQuestions = [
    { pool: ["b", "d", "b", "b", "b", "b", "b"], answer: "d" },
    { pool: ["q", "p", "q", "q", "q", "q", "q"], answer: "p" },
    { pool: ["ด", "ด", "ด", "ด", "ค", "ด", "ด"], answer: "ค" },
    { pool: ["ถ", "ถ", "ภ", "ถ", "ถ", "ถ", "ถ"], answer: "ภ" },
    { pool: ["น", "น", "ม", "น", "น", "น", "น"], answer: "ม" }
];

// 3. 🎯 กระจายตัวแปรควบคุมระดับความยากและเวลาตามเกณฑ์ 3 กลุ่มอายุอย่างแม่นยำ
let questions;
let timeLimit;
let ageGroupText = "";

if (userAge <= 9) {
    questions = easyQuestions;
    timeLimit = 15; // ให้เวลาคิด 15 วินาที
    ageGroupText = "ระดับ: เด็กเล็ก (อายุ 6-9 ปี)";
} else if (userAge <= 18) {
    questions = hardQuestions;
    timeLimit = 7; // ให้เวลาคิด 7 วินาทีเพื่อเพิ่มความท้าทาย
    ageGroupText = "ระดับ: เด็กโตและวัยรุ่น (อายุ 10-18 ปี)";
} else {
    questions = hardQuestions;
    timeLimit = 5; // ท้าทายระดับสูงสุดด้วยเวลา 5 วินาที สำหรับวัยทำงาน
    ageGroupText = "ระดับ: บุคคลทั่วไปและผู้ใหญ่ (อายุ 19 ปีขึ้นไป)";
}

let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let timeLeft;
let isAnswered = false; // 🔒 ป้องกันการกดเบิ้ลคำตอบ

// ดึง Elements จากหน้า HTML
const ageLevelBadge = document.getElementById("age-level");
const timerBar = document.getElementById("timer-bar"); // ⏳ แถบขีดเวลาหดสั้นลง
const letterDisplay = document.getElementById("letter-display");
const resultArea = document.getElementById("result-area");
const questionCounterText = document.getElementById("question-counter-text");

// 🛠️ ฟังก์ชันเตรียมปุ่มเริ่มสำหรับหน้าแนะนำวิธีเล่นก่อนเข้าเกม
function prepareIntro() {
    const btnStartPlay = document.getElementById("btn-start-play");
    const introSection = document.getElementById("introSection");
    const gameMainContent = document.getElementById("gameMainContent");

    if (btnStartPlay) {
        btnStartPlay.onclick = () => {
            // หยุดเสียงอ่านคำอธิบายทันทีเมื่อกดเข้าเกม
            window.speechSynthesis.cancel();
            // ซ่อนหน้าแนะแนววิธีเล่น
            if (introSection) introSection.classList.add("hidden");
            // เปิดหน้ากระดานเล่นเกมหลัก
            if (gameMainContent) gameMainContent.classList.remove("hidden");
            // สั่งเริ่มรันเกมทันที
            startGame();
        };
    }
}

// เริ่มต้นระบบตัวแปรและข้อมูลส่วนหัว
function startGame() {
    if (ageLevelBadge) {
        ageLevelBadge.innerText = ageGroupText;
    }
    loadQuestion();
}

// โหลดโจทย์แต่ละข้อ
function loadQuestion() {
    clearInterval(timerInterval);
    if (!letterDisplay) return;

    // ตรวจสอบว่าเล่นครบทุกข้อหรือยัง
    if (currentQuestionIndex >= questions.length) {
        endGame();
        return;
    }

    if (questionCounterText) {
        questionCounterText.innerText = `ข้อที่: ${currentQuestionIndex + 1}/${questions.length}`;
    }

    isAnswered = false;
    timeLeft = timeLimit;
    
    if (timerBar) timerBar.style.width = "100%";
    
    timerInterval = setInterval(() => {
        timeLeft--;
        if (timerBar) {
            const timePercent = (timeLeft / timeLimit) * 100;
            timerBar.style.width = `${timePercent}%`;
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            nextQuestion(); // หมดเวลาข้ามไปข้อถัดไปทันที
        }
    }, 1000);

    // พ่นปุ่มตัวอักษรบนหน้าจอ
    letterDisplay.innerHTML = "";
    const currentQuestion = questions[currentQuestionIndex];
    currentQuestion.pool.forEach((char) => {
        const button = document.createElement("button");
        button.className = "char-btn";
        button.innerText = char;
        button.onclick = () => checkAnswer(char, currentQuestion.answer);
        letterDisplay.appendChild(button);
    });
}

// ตรวจคำตอบ
function checkAnswer(selected, correct) {
    if (isAnswered) return;
    isAnswered = true; // ล็อกทันทีป้องกัน Double Click
    if (selected === correct) {
        score++;
    }
    clearInterval(timerInterval);
    setTimeout(() => {
        nextQuestion();
    }, 200);
}

// ไปข้อถัดไป
function nextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
}

// 📊 จบเกม บันทึกข้อมูล และกระจายแต้มลงกล่องคู่พาสเทล
function endGame() {
    clearInterval(timerInterval);
    if (timerBar) timerBar.style.width = "0%";
    
    const gamePlaySection = document.getElementById("gamePlaySection");
    if (gamePlaySection) gamePlaySection.classList.add("hidden");
    
    // 💾 บันทึกคะแนนลง localStorage ของเกมที่ 1
    localStorage.setItem("letterDetectiveScore", score);
    
    const correctNum = document.getElementById("correct-num");
    const wrongNum = document.getElementById("wrong-num");
    
    if (correctNum) correctNum.textContent = score;
    if (wrongNum)   wrongNum.textContent = questions.length - score;

    if (resultArea) {
        resultArea.classList.remove("hidden");
    }
}

// เมื่อโหลดหน้าเว็บเสร็จ ให้แสดงหน้าแนะนำวิธีเล่นก่อนเป็นอันดับแรก
window.onload = prepareIntro;


// ==========================================================
// 🔊 ระบบควบคุมเสียงอ่านประจำด่านที่ 1 (นักสืบตัวอักษร)
// ==========================================================

function speakGameText(text) {
    window.speechSynthesis.cancel(); // หยุดเสียงเก่าทันทีป้องกันการพูดซ้อนกัน
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH'; // กำหนดสำเนียงภาษาไทย
    utterance.rate = 1.0;     // ความเร็วปกติ
    window.speechSynthesis.speak(utterance);
}

// 🔊 คำสั่งสำหรับปุ่มลำโพงในหน้าอธิบายวิธีเล่น (Intro)
function speakIntro() {
    let texts = ["เกมที่ 1 นักสืบตัวอักษร. มาทดสอบความช่างสังเกตและความเร็วในการมองเห็นตัวอักษรกันครับ!"];
    const card = document.getElementById("intro-text-card");
    if (card) {
        const paragraphs = card.querySelectorAll("p");
        paragraphs.forEach(p => {
            texts.push(p.innerText.replace("👉", "").trim());
        });
    }
    speakGameText(texts.join(". "));
}

// 🔊 คำสั่งสำหรับปุ่มลำโพงในหน้ากระดานเล่นเกมจริง (Gameplay)
function speakGameplay() {
    speakGameText("จงคลิกเลือกตัวอักษรที่แตกต่างจากพวกให้เร็วที่สุด");
}