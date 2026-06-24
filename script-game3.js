// ===== script-game3.js — Speed Reading Game (3-Age Groups Edition) =====

// ===== คลังคำตามกลุ่มอายุ =====
const WORD_BANKS = {
  child: [
    "ตา", "ปู", "กา", "หู", "ขา",
    "ม้า", "ดี", "ไป", "โรงเรียน", "กินข้าว"
  ],
  teen: [
    "แมวกินปลาทู", "ฉันไปโรงเรียน", "น้องนอนหลับฝันดี",
    "พ่อล้างรถยนต์", "แม่ทำอาหารอร่อย", "หมาวิ่งไล่จับบอล",
    "คุณครูใจดีมาก", "นกบินบนท้องฟ้า", "ฉันชอบอ่านหนังสือ",
    "พี่ปั่นจักรยานสีแดง"
  ],
  adult: [
    "นวัตกรรมเทคโนโลยีช่วยพัฒนาศักยภาพของมนุษย์",
    "การวางแผนยุทธศาสตร์ที่ดีช่วยสร้างเสถียรภาพทางการเงิน",
    "ผู้ประกอบการรุ่นใหม่มักใช้ความคิดสร้างสรรค์ในการทำธุรกิจ",
    "สถาปัตยกรรมไทยแสดงถึงภูมิปัญญาอันล้ำค่าของบรรพบุรุษ",
    "ประชาธิปไตยที่สมบูรณ์ต้องอาศัยความสามัคคีของคนในชาติ",
    "ภาพยนตร์เรื่องนี้สะท้อนประสบการณ์ชีวิตที่หลากหลาย",
    "สื่อสารมวลชนมีบทบาทสำคัญในการแพร่กระจายข้อมูลข่าวสาร",
    "การวิเคราะห์ข้อมูลอย่างแม่นยำช่วยลดความเสี่ยงในการลงทุน",
    "สัมพันธภาพที่ดีในครอบครัวเป็นรากฐานของสังคมที่เข้มแข็ง",
    "พลังงานสะอาดเป็นสิ่งจำเป็นต่อการอนุรักษ์ธรรมชาติในอนาคต"
  ]
};

// ===== ค่าคงที่ =====
const TOTAL_QUESTIONS = 5;
const TIME_LIMIT      = 15;       

const USER_AGE        = localStorage.getItem("userAge") ? parseInt(localStorage.getItem("userAge")) : 15;
const AGE_GROUP       = USER_AGE <= 9 ? "child" : (USER_AGE <= 18 ? "teen" : "adult");

// ===== state =====
let questions     = [];
let qIdx          = 0;
let correctCount  = 0;
let wrongCount    = 0;
let timeLeft      = TIME_LIMIT;
let timerInterval = null;
let userHasSpoken = false; // บันทึกว่าผู้เล่นได้เริ่มเปล่งเสียงพูดออกมาเป็นคำหรือยัง
let isCorrectText = false; // บันทึกผลลัพธ์ว่าคำที่พูดออกเสียงถูกต้องตามโจทย์หรือไม่
let timeUsedInCorrectRounds = 0; 

// ===== Speech Recognition =====
let recognition = null;
let isRecording = false;

// ===== DOM refs =====
const elQuestionNum  = document.getElementById("question-num");
const elProgressBar  = document.getElementById("progress-bar");
const elTextCard     = document.getElementById("text-card");
const elHeardText    = document.getElementById("heard-text");
const elMicBtn       = document.getElementById("mic-btn");
const elDoneBtn      = document.getElementById("done-btn");
const elGameSection  = document.getElementById("game-section");
const elSummary      = document.getElementById("summary");
const elCorrectNum   = document.getElementById("correct-num");
const elWrongNum     = document.getElementById("wrong-num");
const elNoSupport    = document.getElementById("no-support");
const elIntroSection = document.getElementById("intro-section");

// ===== Utility =====
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalize(str) {
  return str.replace(/\s+/g, "").trim();
}

function isMatch(heard, target) {
  const h = normalize(heard);
  const t = normalize(target);
  return h === t || h.includes(t) || t.includes(h);
}

function pickQuestions() {
  const bank = WORD_BANKS[AGE_GROUP] || WORD_BANKS.teen;
  return shuffle(bank).slice(0, TOTAL_QUESTIONS);
}

// ===== Control Flow: การสลับหน้าแรกและเริ่มเล่นเกมจริง =====
function startGame() {
  window.speechSynthesis.cancel(); 
  elIntroSection.classList.add("hidden");
  elGameSection.classList.remove("hidden");
  showQuestion(); 
}

// ===== Timer =====
function startTimer() {
  timeLeft = TIME_LIMIT;
  elProgressBar.style.width = "100%";
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    timeLeft -= 0.1;
    const pct = Math.max(0, (timeLeft / TIME_LIMIT) * 100);
    elProgressBar.style.width = pct + "%";

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      stopRecognition();
      wrongCount++;
      setTimeout(() => advanceQuestion(), 400);
    }
  }, 100);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// ===== แสดงโจทย์ =====
function showQuestion() {
  userHasSpoken = false;
  isCorrectText = false;

  elQuestionNum.textContent = `ข้อที่: ${qIdx + 1}/${TOTAL_QUESTIONS}`;
  elTextCard.textContent    = questions[qIdx];
  elHeardText.textContent   = "คลิกปุ่มไมค์เพื่อเริ่มพูด...";
  elHeardText.className     = "";

  elDoneBtn.setAttribute("disabled", true);
  elDoneBtn.style.opacity       = "0.45";
  elDoneBtn.style.pointerEvents = "none";

  elMicBtn.className   = "";
  elMicBtn.textContent = "🎙 เริ่มพูด";
  isRecording          = false;

  startTimer();
}

function unlockDoneButton() {
  elDoneBtn.removeAttribute("disabled");
  elDoneBtn.style.opacity       = "1";
  elDoneBtn.style.pointerEvents = "auto";
}

// ฟังก์ชันกดปุ่ม "อ่านเสร็จแล้ว" (จะคิดคะแนนตามความถูกต้องจริงของคำที่พูดออกมา)
function nextQuestion() {
  if (!userHasSpoken) return;           
  
  stopTimer();
  stopRecognition();

  if (isCorrectText) {
    correctCount++;
    const timeUsed = TIME_LIMIT - timeLeft;
    timeUsedInCorrectRounds += timeUsed;
  } else {
    wrongCount++;
  }

  advanceQuestion();
}

// ⬜ ฟังก์ชันกดปุ่ม "ยืนยันคำตอบ (ข้าม)" ด้านล่างสุด (คิดเป็นข้อผิด/ข้ามทันที)
function forceSkipQuestion() {
  stopTimer();
  stopRecognition();
  wrongCount++;
  advanceQuestion();
}

function advanceQuestion() {
  qIdx++;
  if (qIdx < TOTAL_QUESTIONS) {
    showQuestion();
  } else {
    showSummary();
  }
}

function showSummary() {
  stopTimer();
  stopRecognition();
  elGameSection.style.display = "none";
  elSummary.style.display     = "block";
  elCorrectNum.textContent    = correctCount;
  elWrongNum.textContent      = wrongCount;

  let averageTime = correctCount > 0 ? (timeUsedInCorrectRounds / correctCount).toFixed(2) : 0;

  localStorage.setItem("speedReadingScore", correctCount);
  localStorage.setItem("speedReadingWrong", wrongCount);
  localStorage.setItem("speedReadingAvgTime", averageTime);

  const btnRestart = document.querySelector("#summary button");
  if (btnRestart) {
    btnRestart.textContent = "เสร็จสิ้น ➡️";
    btnRestart.setAttribute("onclick", "window.location.href='summary.html'");
  }
}

// ===== Speech Recognition Setup =====
function setupSpeech() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    elNoSupport.style.display = "block";
    elMicBtn.disabled = true;
    elMicBtn.textContent = "🚫 ไม่รองรับเสียง";
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang            = "th-TH";
  recognition.continuous      = true;
  recognition.interimResults  = true;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    let interim = "";
    let final   = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        final += transcript;
      } else {
        interim += transcript;
      }
    }

    const heard = (final || interim).trim();
    if (!heard) return;

    elHeardText.textContent = heard;

    // เมื่อเริ่มพูดแตกเป็นคำแล้ว ให้ปลดล็อกปุ่ม "อ่านเสร็จแล้ว" ทันที ไม่ว่าคำนั้นจะถูกหรือผิด
    if (!userHasSpoken) {
      userHasSpoken = true;
      unlockDoneButton();
    }

    // ตรวจสอบความถูกต้องเก็บไว้ในสเตตัสในระบบ (ไม่บังคับเด้งสีเขียวหรือข้ามอัตโนมัติ เพื่อไม่ให้เป็นการเฉลย)
    if (isMatch(heard, questions[qIdx])) {
      isCorrectText = true;
      elHeardText.className = "matched"; // แสดงผลตัวหนังสือหนาขึ้นเพื่อความสวยงาม
    } else {
      isCorrectText = false;
      elHeardText.className = "";
    }
  };

  recognition.onerror = (event) => {
    console.warn("Speech error:", event.error);
  };

  recognition.onend = () => {
    if (isRecording) {
      try { recognition.start(); } catch (e) { /* ignore */ }
    } else {
      isRecording = false;
      elMicBtn.className   = "";
      elMicBtn.textContent = "🎙 เริ่มพูด";
    }
  };
}

function toggleMic() {
  if (!recognition) {
    alert("เบราว์เซอร์ไม่รองรับ Web Speech API\nกรุณาเปิดด้วย Chrome หรือ Edge");
    return;
  }
  if (isRecording) {
    stopRecognition();
  } else {
    startRecognition();
  }
}

function startRecognition() {
  isRecording              = true;
  elMicBtn.className       = "recording";
  elMicBtn.textContent     = "⏹ หยุดฟัง";
  elHeardText.textContent  = "กำลังฟัง...";
  elHeardText.className    = "";
  try { recognition.start(); } catch (e) { /* ignore */ }
}

function stopRecognition() {
  isRecording          = false;
  elMicBtn.className   = "";
  elMicBtn.textContent = "🎙 เริ่มพูด";
  try { recognition.stop(); } catch (e) { /* ignore */ }
}

// ===== ระบบฟังก์ชันอ่านออกเสียงคำชี้แจงกติกา =====
function toggleInstructionSpeech() {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  } else {
    let msgText = "เกมที่ 3 เกมฝึกอ่านเร็ว มาทดสอบความถูกต้องและเสถียรภาพในการออกเสียงคำศัพท์กันครับ สังเกตข้อความหรือประโยคที่ปรากฏในกล่องข้อความตรงกลาง กดปุ่มเริ่มพูดด้านล่าง แล้วเปล่งเสียงอ่านตามโจทย์ เมื่ออ่านเสร็จแล้วให้กดปุ่มเพื่อไปข้อถัดไป";
    const utterance = new SpeechSynthesisUtterance(msgText);
    utterance.lang = "th-TH";
    window.speechSynthesis.speak(utterance);
  }
}

// ===== Init =====
setupSpeech();
questions = pickQuestions();