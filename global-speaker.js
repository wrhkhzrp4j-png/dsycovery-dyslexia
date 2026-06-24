// ===== global-speaker.js — ฉบับสมบูรณ์ แก้ไขระบบเปิด-ปิดเสียงแยกหัวข้อแล้ว =====

// 1. ฟังก์ชันอ่านออกเสียงหลักของคุณ
function speakText(text) {
    speechSynthesis.cancel(); // ล้างเสียงที่ค้างอยู่ก่อนหน้า
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "th-TH";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
}

// 2. ฟังก์ชันอ่านจาก Element ID (อัปเดต: กดซ้ำแล้วจะหยุดพูดทันที)
function speakElement(id) {
    // 🛑 ถ้าเบราว์เซอร์กำลังพูดอยู่แล้วกดซ้ำ ให้สั่งหยุดพูดแล้วจบฟังก์ชันทันที
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        return; 
    }

    const element = document.getElementById(id);
    if (element) {
        // เริ่มต้นด้วยข้อความของตัวหัวข้อเอง
        let textToSpeak = element.innerText;
        
        // วิ่งหาเนื้อหา (<p>, <ul>, <li>) ที่อยู่ภายใต้หัวข้อนี้มาอ่านให้ฟังด้วย
        let nextEl = element.nextElementSibling;
        while (nextEl && nextEl.tagName !== "H2" && nextEl.tagName !== "H3" && !nextEl.classList.contains("speak-element-btn")) {
            if (nextEl.innerText.trim() !== "") {
                textToSpeak += " \n " + nextEl.innerText;
            }
            nextEl = nextEl.nextElementSibling; // เลื่อนไปแท็กถัดไป
        }

        // ส่งข้อความทั้งหมดไปให้อ่าน
        speakText(textToSpeak);
    }
}

// 3. ระบบตรวจจับปุ่มอ่านทั้งหน้าอัตโนมัติเมื่อโหลดหน้าจอเสร็จ
document.addEventListener("DOMContentLoaded", function () {
    const speakBtn = document.querySelector(".global-speak-btn");
    
    if (!speakBtn) return; // ถ้าหน้านั้นไม่มีปุ่มอ่านทั้งหน้า ให้ข้ามไป ไม่ฟ้อง Error

    let isSpeaking = false;

    speakBtn.addEventListener("click", function () {
        if (isSpeaking) {
            speechSynthesis.cancel();
            isSpeaking = false;
            speakBtn.innerHTML = "🔊 อ่านทั้งหน้า";
            return;
        }

        // กวาดสายตาหาข้อความทั้งหมดในหน้า (h1, h2, h3, p, li) มารวมกัน
        const textElements = document.querySelectorAll("h1, h2, h3, p, li");
        let combinedText = "";

        textElements.forEach((el) => {
            // ไม่เอาข้อความที่อยู่ในปุ่มกด และต้องไม่เป็นข้อความว่างเปล่า
            if (!el.closest("button") && el.innerText.trim() !== "") {
                combinedText += el.innerText + " \n ";
            }
        });

        if (combinedText.trim() === "") return;

        // เรียกใช้ฟังก์ชัน speakText ส่งข้อความรวมเข้าไปอ่าน
        speakText(combinedText);
        
        isSpeaking = true;
        speakBtn.innerHTML = "⏹️ หยุดอ่านออกเสียง";

        // ตรวจสอบสถานะการพูดเป็นระยะเพื่อเปลี่ยนข้อความบนปุ่มกลับเมื่ออ่านจบหน้า
        const checkEndInterval = setInterval(() => {
            if (!speechSynthesis.speaking) {
                isSpeaking = false;
                speakBtn.innerHTML = "🔊 อ่านทั้งหน้า";
                clearInterval(checkEndInterval);
            }
        }, 300);
    });

    // ถ้าผู้ใช้กดปิดหรือเปลี่ยนหน้า ให้เสียงหยุดพูดทันทีเพื่อป้องกันเสียงหลอนข้ามหน้า
    window.addEventListener("beforeunload", () => {
        speechSynthesis.cancel();
    });
});