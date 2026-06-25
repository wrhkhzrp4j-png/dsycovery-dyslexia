document.addEventListener("DOMContentLoaded", function () {
    // 1. ดึงฟอร์มจากหน้า HTML
    const form = document.querySelector("form");

    if (form) {
        // 2. ดักจับเหตุการณ์ตอนที่ผู้ใช้กดปุ่ม "ถัดไป" (Submit Form)
        form.addEventListener("submit", function (event) {
            // หยุดการทำงานปกติของฟอร์มไว้ก่อน เพื่อจัดการข้อมูลเอง
            event.preventDefault();

            // 3. ดึงค่าอายุและข้อมูลอื่นๆ ออกมาจากฟอร์ม (✂️ ลบดึงค่าภาษาแม่ออกแล้ว)
            const ageInput = document.getElementById("age").value;
            const thaiSkillInput = document.getElementById("thai_skill").value;
            const gameSkillInput = document.getElementById("game_skill").value;

            // ดึงค่าพฤติกรรมการอ่าน (Checkbox) ที่ผู้ใช้ติ๊กเลือก (เก็บเป็น Array)
            const selectedBehaviors = [];
            const checkboxes = document.querySelectorAll('input[name="reading_behavior"]:checked');
            checkboxes.forEach(function (checkbox) {
                selectedBehaviors.push(checkbox.value);
            });

            // 4. บันทึกข้อมูลทั้งหมดลงใน Session Storage ของเบราว์เซอร์ (✂️ ลบบรรทัด userLanguage ออกแล้ว)
            sessionStorage.setItem("userAge", ageInput);
            // 💾 บันทึกเพิ่มลง localStorage เพื่อรองรับตัวแปรดึงค่าของเกมที่ 1 ที่เรียกหา localStorage.getItem("userAge")
            localStorage.setItem("userAge", ageInput);
            
            sessionStorage.setItem("userThaiSkill", thaiSkillInput);
            sessionStorage.setItem("userGameSkill", gameSkillInput);
            sessionStorage.setItem("userBehaviors", JSON.stringify(selectedBehaviors));

            // แนะนำให้ใช้เครื่องหมาย Backtick (ปุ่มเปลี่ยนภาษา) เพื่อให้เล่นกับตัวแปร ${ageInput} ได้สมบูรณ์ครับ
window.location.href = `letter-detective.html?age=${ageInput}`;
        });
    }
});

// ==========================================================
// 🔊 [ปรับปรุงใหม่] ระบบควบคุมการอ่านออกเสียงภาษาไทยแบบสลับ เล่น/หยุด
// ==========================================================

// ตัวแปรสำหรับจำสถานะการอ่านล่าสุด
let lastSpokenText = ""; 

function speakText(text) {
    // 1. ถ้ากำลังพูดข้อความเดิมอยู่ -> ให้หยุดชั่วคราว (Pause)
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused && lastSpokenText === text) {
        window.speechSynthesis.pause();
        return;
    }

    // 2. ถ้าถูกหยุดชั่วคราวไว้ และเป็นข้อความเดิม -> ให้พูดต่อจากเดิม (Resume)
    if (window.speechSynthesis.paused && lastSpokenText === text) {
        window.speechSynthesis.resume();
        return;
    }

    // 3. ถ้าเป็นข้อความใหม่ หรือเสียงเดิมเล่นจบไปแล้ว -> ให้เริ่มเล่นใหม่ตั้งแต่ต้น
    window.speechSynthesis.cancel(); // ล้างคิวเสียงเก่าทั้งหมดก่อน
    lastSpokenText = text; // บันทึกข้อความล่าสุดที่สั่งอ่าน

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH'; // บังคับให้เป็นสำเนียงภาษาไทย
    utterance.rate = 1.0;     // ตั้งระดับความเร็วปกติ

    // เมื่ออ่านจบประโยคให้ล้างค่าตัวแปร เพื่อให้กดซ้ำแล้วเริ่มใหม่ได้
    utterance.onend = function () {
        lastSpokenText = "";
    };

    window.speechSynthesis.speak(utterance);
}

// ฟังก์ชันกวาดเนื้อหาแยกเฉพาะเซกชันมาอ่านอย่างชาญฉลาด
function speakSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    let textsToSpeak = [];
    
    // 1. ดึงข้อความหัวข้อประจำเซกชัน
    const title = section.querySelector('.section-title');
    if (title) textsToSpeak.push(title.innerText);

    // 2. ดึงข้อความคำถามหลัก (ถ้ามี)
    const mainLabel = section.querySelector('.main-label');
    if (mainLabel) textsToSpeak.push(mainLabel.innerText);

    // 3. กวาดป้ายตัวเลือก (Labels) และข้อความใน Checkbox ทั้งหมดมาคัดกรอกคำพูด
    const labels = section.querySelectorAll('label:not(.main-label), .checkbox-label span');
    labels.forEach(label => {
        // กรองเครื่องหมายดาวแดง (*) ออก ไม่ให้ออกเสียงเอ๋อคำว่า "ดอกจัน"
        const cleanText = label.innerText.replace('*', '').trim();
        if (cleanText) textsToSpeak.push(cleanText);
    });

    // 4. ดึงคำชี้แจงสัญลักษณ์ 👉 ด้านล่างสุด
    const helpers = section.querySelectorAll('.helper-text');
    helpers.forEach(helper => textsToSpeak.push(helper.innerText));

    // รวมข้อความเข้าด้วยกันโดยเว้นจังหวะด้วยจุด (.) เพื่อให้ระบบหยุดหายใจฟังง่ายขึ้น
    const finalSpeech = textsToSpeak.join(". ");
    
    // ส่งข้อความที่รวมแล้วไปประมวลผลการ เล่น/หยุด ที่ฟังก์ชันหลัก
    speakText(finalSpeech);
}
เขียนข้อความ